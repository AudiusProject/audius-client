import { takeEvery, select, call, put, delay, all } from 'typed-redux-saga'

import {
  Chain,
  Collectible,
  ID,
  Kind,
  Name,
  PremiumContentSignature,
  PremiumTrackStatus,
  Track,
  TrackMetadata
} from 'models'
import { User } from 'models/User'
import { FeatureFlags, IntKeys } from 'services/remote-config'
import { accountSelectors } from 'store/account'
import { cacheActions, cacheTracksSelectors } from 'store/cache'
import { collectiblesActions } from 'store/collectibles'
import { getContext } from 'store/effects'
import { musicConfettiActions } from 'store/music-confetti'
import { usersSocialActions } from 'store/social'
import { tippingActions } from 'store/tipping'
import { parseTrackRouteFromPermalink } from 'utils'
import { Nullable } from 'utils/typeUtils'

import * as premiumContentSelectors from './selectors'
import { actions as premiumContentActions } from './slice'

type TrackRouteParams =
  | { slug: string; trackId: null; handle: string }
  | { slug: null; trackId: ID; handle: null }
  | null

const {
  updatePremiumContentSignatures,
  removePremiumContentSignatures,
  updatePremiumTrackStatus,
  updatePremiumTrackStatuses
} = premiumContentActions

const { refreshTipGatedTracks } = tippingActions
const { show: showConfetti } = musicConfettiActions

const { updateUserEthCollectibles, updateUserSolCollectibles } =
  collectiblesActions

const { getPremiumTrackSignatureMap } = premiumContentSelectors

const { getAccountUser, getUserId } = accountSelectors
const { getTracks } = cacheTracksSelectors

function hasNotFetchedAllCollectibles(account: User) {
  const { collectibleList, solanaCollectibleList } = account
  const hasCollectibles = account?.has_collectibles ?? false
  return (
    collectibleList === undefined ||
    solanaCollectibleList === undefined ||
    (hasCollectibles && !account.collectibles)
  )
}

// Map of track ids for which to attempt to get signature.
// Include token ids for ERC1155 nfts.
function* getTokenIdMap({
  tracks,
  ethCollectibles,
  solCollectibles,
  premiumTrackSignatureIdSet
}: {
  tracks: { [id: ID]: Track }
  ethCollectibles: Collectible[]
  solCollectibles: Collectible[]
  premiumTrackSignatureIdSet: Set<ID>
}) {
  const trackMap: { [id: ID]: string[] } = {}
  const skipped: Set<ID> = new Set()

  // Build map of eth nft contract address -> list of token ids
  // ERC1155 requires token ids to get the balance of a wallet for a given collection
  // We can ignore token ids for ERC721 nfts
  const ethContractMap: { [address: string]: string[] } = {}
  ethCollectibles.forEach((c: Collectible) => {
    if (!c.assetContractAddress) return

    if (ethContractMap[c.assetContractAddress]) {
      ethContractMap[c.assetContractAddress].push(c.tokenId)
    } else {
      ethContractMap[c.assetContractAddress] = [c.tokenId]
    }
  })

  // Build a set of sol nft collection mint addresses
  const solCollectionMintSet: Set<string> = new Set()
  solCollectibles.forEach((c: Collectible) => {
    if (!c.solanaChainMetadata) return

    // "If the Collection field is set, it means the NFT is part of the collection specified within that field."
    // https://docs.metaplex.com/programs/token-metadata/certified-collections#linking-regular-nfts-to-collection-nfts
    const { collection } = c.solanaChainMetadata
    if (collection?.verified) {
      // Weirdly enough, sometimes the key is a string, and other times it's a PublicKey
      // even though the @metaplex-foundation collection type defines it as a web3.PublicKey
      const mintKey =
        typeof collection.key === 'string'
          ? collection.key
          : collection.key.toBase58()
      solCollectionMintSet.add(mintKey)
    }
  })

  Object.keys(tracks)
    .map(Number)
    .filter(Boolean)
    .forEach((trackId) => {
      if (premiumTrackSignatureIdSet.has(trackId)) {
        // skip this track entry if we already have a signature for it
        skipped.add(trackId)
        return
      }

      // skip this track entry if it is not premium or if it is not gated on an nft collection
      const { is_premium: isPremium, premium_conditions: premiumConditions } =
        tracks[trackId]
      if (!isPremium || !premiumConditions || !premiumConditions.nft_collection)
        return

      // Set the token ids for ERC1155 nfts as the balanceOf contract method
      // which will be used to determine ownership requires the user's
      // wallet address and token ids

      // todo: fix the string nft_collection to be an object
      // temporarily parse it into object here for now
      let { nft_collection: nftCollection } = premiumConditions
      if (typeof nftCollection === 'string') {
        nftCollection = JSON.parse(
          (premiumConditions.nft_collection as unknown as string).replaceAll(
            "'",
            '"'
          )
        )
      }

      if (nftCollection.chain === Chain.Eth) {
        // skip this track entry if user does not own an nft from its nft collection gate
        const tokenIds = ethContractMap[nftCollection.address]
        if (!tokenIds || !tokenIds.length) return

        // add trackId <> tokenIds entry if track is gated on ERC1155 nft collection,
        // otherwsise, set tokenIds for trackId to empty array
        trackMap[trackId] =
          nftCollection.standard === 'ERC1155'
            ? ethContractMap[nftCollection.address]
            : []
      } else if (nftCollection.chain === Chain.Sol) {
        if (solCollectionMintSet.has(nftCollection.address)) {
          // add trackId to trackMap, no need for tokenIds here
          trackMap[trackId] = []
        }
      }
    })

  return { trackMap, skipped }
}

function* updateNewPremiumContentSignatures({
  tracks,
  premiumTrackSignatureIdSet
}: {
  tracks: Track[]
  premiumTrackSignatureIdSet: Set<number>
}) {
  const premiumContentSignatureMap: { [id: ID]: PremiumContentSignature } = {}

  tracks.forEach((track: Track) => {
    const {
      premium_content_signature: premiumContentSignature,
      track_id: trackId
    } = track

    // skip this track entry if we already have a signature for it
    if (premiumTrackSignatureIdSet.has(trackId)) return

    // skip this track entry if its metadata does not include a signature
    if (!premiumContentSignature) return

    premiumContentSignatureMap[trackId] = premiumContentSignature
  })

  if (Object.keys(premiumContentSignatureMap).length > 0) {
    yield* put(updatePremiumContentSignatures(premiumContentSignatureMap))
  }
}

/**
 * Builds a map of nft-gated track ids and relevant info to make a request to DN
 * which confirms that user owns the corresponding nft collections by returning corresponding premium content signatures.
 *
 * Runs when eth or sol nfts are fetched, or when new tracks have been added to the cache.
 * Halts if not all nfts have been fetched yet. Similarly, does not proceed if no tracks are in the cache yet.
 * Skips tracks whose signatures have already been previously obtained.
 */
function* updateCollectibleGatedTrackAccess(
  action:
    | ReturnType<typeof updateUserEthCollectibles>
    | ReturnType<typeof updateUserSolCollectibles>
    | ReturnType<typeof cacheActions.addSucceeded>
    | ReturnType<typeof cacheActions.update>
) {
  // Halt if premium content not enabled
  const getFeatureEnabled = yield* getContext('getFeatureEnabled')
  if (!getFeatureEnabled(FeatureFlags.PREMIUM_CONTENT_ENABLED)) {
    return
  }

  const account = yield* select(getAccountUser)

  // Halt if nfts fetched are not for logged in account
  const areCollectiblesFetched = [
    updateUserEthCollectibles.type,
    updateUserSolCollectibles.type
  ].includes(action.type)
  const userIdForCollectibles =
    areCollectiblesFetched && 'payload' in action ? action.payload.userId : null
  if (userIdForCollectibles && account?.user_id !== userIdForCollectibles)
    return

  // get tracks for which we already previously got the signatures
  // filter out those tracks from the ones that need to be passed in to the DN request
  const premiumTrackSignatureMap = yield* select(getPremiumTrackSignatureMap)
  const premiumTrackSignatureIdSet = new Set(
    Object.keys(premiumTrackSignatureMap).map(Number)
  )

  // update premium content signatures from tracks' metadata with the signature
  const areTracksUpdated =
    'kind' in action && action.kind === Kind.TRACKS && !!action.entries.length
  if (areTracksUpdated) {
    yield* call(updateNewPremiumContentSignatures, {
      tracks: action.entries.map(
        ({ metadata }: { metadata: Partial<TrackMetadata> }) => metadata
      ),
      premiumTrackSignatureIdSet
    })
  }

  // halt if no logged in user
  if (!account) return

  // halt if not all nfts have been fetched yet
  if (yield* call(hasNotFetchedAllCollectibles, account)) return

  // halt if no tracks in cache and no added tracks
  const cachedTracks = yield* select(getTracks, {})
  const newlyUpdatedTracks = areTracksUpdated ? action.entries : []
  if (!Object.keys(cachedTracks).length && !newlyUpdatedTracks.length) return

  const allTracks = {
    ...cachedTracks,
    ...newlyUpdatedTracks.reduce(
      (
        acc: { [id: ID]: Track },
        curr: { id: number; uid: string; metadata: Track }
      ) => {
        acc[curr.metadata.track_id] = curr.metadata
        return acc
      },
      []
    )
  }

  const { trackMap, skipped } = yield* call(getTokenIdMap, {
    tracks: allTracks,
    ethCollectibles: account.collectibleList || [],
    solCollectibles: account.solanaCollectibleList || [],
    premiumTrackSignatureIdSet
  })

  const premiumContentSignatureMap: {
    [id: ID]: Nullable<PremiumContentSignature>
  } = {}
  Object.keys(allTracks).forEach((trackId) => {
    const id = parseInt(trackId)
    if (skipped.has(id)) return

    const { premium_conditions: premiumConditions } = allTracks[trackId]
    if (premiumConditions?.nft_collection && !trackMap[id]) {
      // Set null for collectible gated track signatures as
      // the user does not have nfts for those collections
      // and therefore does not have access.
      premiumContentSignatureMap[id] = null
    }
  })

  if (Object.keys(premiumContentSignatureMap).length > 0) {
    yield* put(updatePremiumContentSignatures(premiumContentSignatureMap))
  }

  if (!Object.keys(trackMap).length) return

  // request premium content signatures for the relevant nft-gated tracks
  // which the client believes the user should have access to
  const apiClient = yield* getContext('apiClient')

  const premiumContentSignatureResponse = yield* call(
    [apiClient, apiClient.getPremiumContentSignatures],
    {
      userId: account.user_id,
      trackMap
    }
  )

  if (premiumContentSignatureResponse) {
    // Keep record of number of tracks that have a signature
    // so that we can later track their metrics.
    let numTrackIdsWithSignature = 0

    const premiumContentSignatureMap: {
      [id: ID]: Nullable<PremiumContentSignature>
    } = { ...premiumContentSignatureResponse }
    // Set null for tracks for which signatures did not get returned
    // to signal that an attempt was made but the user does not have access.
    Object.keys(trackMap).forEach((trackId) => {
      const id = parseInt(trackId)
      if (!premiumContentSignatureResponse[id]) {
        premiumContentSignatureMap[id] = null
      } else {
        numTrackIdsWithSignature++
      }
    })

    // Record when collectible gated tracks are in an unlocked state.
    const analytics = yield* getContext('analytics')
    analytics.track({
      eventName: Name.COLLECTIBLE_GATED_TRACK_UNLOCKED,
      properties: {
        count: numTrackIdsWithSignature
      }
    })

    // update premium content signatures
    if (Object.keys(premiumContentSignatureMap).length > 0) {
      yield* put(updatePremiumContentSignatures(premiumContentSignatureMap))
    }
  }
}

function* pollPremiumTrack({
  trackId,
  currentUserId,
  trackParams,
  frequency
}: {
  trackId: ID
  currentUserId: number
  trackParams: TrackRouteParams
  frequency: number
}) {
  const { slug, handle } = trackParams ?? {}
  if (!slug || !handle) return

  const analytics = yield* getContext('analytics')
  const apiClient = yield* getContext('apiClient')

  while (true) {
    const track = yield* call([apiClient, 'getTrack'], {
      id: trackId,
      currentUserId
    })
    if (track?.premium_content_signature) {
      yield* put(
        cacheActions.update(Kind.TRACKS, [
          {
            id: trackId,
            metadata: {
              premium_content_signature: track.premium_content_signature
            }
          }
        ])
      )
      yield* put(updatePremiumTrackStatus({ trackId, status: 'UNLOCKED' }))
      yield* put(showConfetti())

      const eventName = track.premium_conditions?.follow_user_id
        ? Name.FOLLOW_GATED_TRACK_UNLOCKED
        : track.premium_conditions?.tip_user_id
          ? Name.TIP_GATED_TRACK_UNLOCKED
          : null
      if (eventName) {
        analytics.track({
          eventName,
          properties: {
            trackId
          }
        })
      }

      break
    }
    yield* delay(frequency)
  }
}

const DEFAULT_GATED_TRACK_POLL_INTERVAL_MS = 1000

/**
 * 1. Get follow or tip gated tracks of user
 * 2. Set those track statuses to 'UNLOCKING'
 * 3. Poll for premium content signatures for those tracks
 * 4. When the signatures are returned, set those track statuses as 'UNLOCKED'
 */
function* updateGatedTracks(trackOwnerId: ID, gate: 'follow' | 'tip') {
  const currentUserId = yield* select(getUserId)
  if (!currentUserId) return

  const remoteConfigInstance = yield* getContext('remoteConfigInstance')
  yield* call(remoteConfigInstance.waitForRemoteConfig)
  const gatedTrackPollIntervalMs = remoteConfigInstance.getRemoteVar(IntKeys.GATED_TRACK_POLL_INTERVAL_MS)

  const statusMap: { [id: ID]: PremiumTrackStatus } = {}
  const trackParamsMap: { [id: ID]: TrackRouteParams } = {}
  const cachedTracks = yield* select(getTracks, {})

  Object.keys(cachedTracks).forEach((trackId) => {
    const id = parseInt(trackId)
    const {
      owner_id: ownerId,
      permalink,
      premium_conditions: premiumConditions
    } = cachedTracks[id]
    const isGated =
      gate === 'follow'
        ? premiumConditions?.follow_user_id
        : premiumConditions?.tip_user_id
    if (isGated && ownerId === trackOwnerId) {
      statusMap[id] = 'UNLOCKING'
      trackParamsMap[id] = parseTrackRouteFromPermalink(permalink)
    }
  })

  yield* put(updatePremiumTrackStatuses(statusMap))

  yield* all(
    Object.keys(trackParamsMap).map((trackId) => {
      const id = parseInt(trackId)
      return call(pollPremiumTrack, {
        trackId: id,
        currentUserId,
        trackParams: trackParamsMap[id],
        frequency: gatedTrackPollIntervalMs || DEFAULT_GATED_TRACK_POLL_INTERVAL_MS
      })
    })
  )
}

/**
 * 1. Get follow-gated tracks of unfollowed user
 * 2. Set those track statuses to 'LOCKED'
 * 3. Remove the premium content signatures for those tracks
 */
function* handleUnfollowUser(
  action: ReturnType<typeof usersSocialActions.unfollowUser>
) {
  const statusMap: { [id: ID]: PremiumTrackStatus } = {}
  const cachedTracks = yield* select(getTracks, {})

  Object.keys(cachedTracks).forEach((trackId) => {
    const id = parseInt(trackId)
    const { owner_id: ownerId, premium_conditions: premiumConditions } =
      cachedTracks[id]
    const isFollowGated = premiumConditions?.follow_user_id
    if (isFollowGated && ownerId === action.userId) {
      statusMap[id] = 'LOCKED'
    }
  })

  yield* put(updatePremiumTrackStatuses(statusMap))

  const trackIds = Object.keys(statusMap).map((trackId) => parseInt(trackId))
  yield* put(removePremiumContentSignatures({ trackIds }))
}

function* handleFollowUser(
  action: ReturnType<typeof usersSocialActions.followUser>
) {
  yield* call(updateGatedTracks, action.userId, 'follow')
}

function* handleTipGatedTracks(
  action: ReturnType<typeof refreshTipGatedTracks>
) {
  yield* call(updateGatedTracks, action.payload.userId, 'tip')
}

/**
 * Remove premium content signatures from track metadata when they're
 * no longer accessible by the user.
 */
function* handleRemovePremiumContentSignatures(
  action: ReturnType<typeof removePremiumContentSignatures>
) {
  const cachedTracks = yield* select(getTracks, {
    ids: action.payload.trackIds
  })
  const metadatas = Object.keys(cachedTracks).map((trackId) => {
    const id = parseInt(trackId)
    return { id, metadata: { premium_content_signature: null } }
  })
  yield* put(cacheActions.update(Kind.TRACKS, metadatas))
}

function* watchCollectibleGatedTracks() {
  yield* takeEvery(
    [
      cacheActions.ADD_SUCCEEDED,
      cacheActions.UPDATE,
      updateUserEthCollectibles.type,
      updateUserSolCollectibles.type
    ],
    updateCollectibleGatedTrackAccess
  )
}

function* watchFollowGatedTracks() {
  yield* takeEvery(usersSocialActions.FOLLOW_USER, handleFollowUser)
}

function* watchUnfollowGatedTracks() {
  yield* takeEvery(usersSocialActions.UNFOLLOW_USER, handleUnfollowUser)
}

function* watchTipGatedTracks() {
  yield* takeEvery(refreshTipGatedTracks.type, handleTipGatedTracks)
}

function* watchRemovePremiumContentSignatures() {
  yield* takeEvery(
    removePremiumContentSignatures.type,
    handleRemovePremiumContentSignatures
  )
}

export const sagas = () => {
  return [
    watchCollectibleGatedTracks,
    watchFollowGatedTracks,
    watchUnfollowGatedTracks,
    watchTipGatedTracks,
    watchRemovePremiumContentSignatures
  ]
}
