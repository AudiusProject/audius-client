import {
  cacheActions,
  accountSelectors,
  cacheTracksSelectors,
  Collectible,
  User,
  Track,
  getContext,
  Kind,
  PremiumContentSignature,
  ID,
  Chain,
  FeatureFlags,
  premiumContentSelectors,
  premiumContentActions,
  collectiblesActions,
  trackPageActions,
  TrackMetadata,
  Nullable
} from '@audius/common'
import { takeEvery, select, call, put, delay } from 'typed-redux-saga'

import { TrackRouteParams } from 'utils/route/trackRouteParser'
import { waitForWrite } from 'utils/sagaHelpers'

const {
  updatePremiumContentSignatures,
  updatePremiumTrackStatus,
  refreshPremiumTrack
} = premiumContentActions

const { updateUserEthCollectibles, updateUserSolCollectibles } =
  collectiblesActions

const { getPremiumTrackSignatureMap } = premiumContentSelectors

const { getAccountUser } = accountSelectors
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
  tracks: { [id: number]: Track }
  ethCollectibles: Collectible[]
  solCollectibles: Collectible[]
  premiumTrackSignatureIdSet: Set<number>
}) {
  const trackMap: { [id: number]: string[] } = {}

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
      // skip this track entry if we already have a signature for it
      if (premiumTrackSignatureIdSet.has(trackId)) return

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

  return trackMap
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

  yield* put(updatePremiumContentSignatures(premiumContentSignatureMap))
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
  yield* waitForWrite()
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
  const areTracksAdded =
    'kind' in action && action.kind === Kind.TRACKS && !!action.entries.length
  if (areTracksAdded) {
    yield* call(updateNewPremiumContentSignatures, {
      tracks: action.entries.map(
        ({ metadata }: { metadata: TrackMetadata }) => metadata
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
  const newlyAddedTracks = areTracksAdded ? action.entries : []
  if (!Object.keys(cachedTracks).length && !newlyAddedTracks.length) return

  const allTracks = {
    ...cachedTracks,
    ...newlyAddedTracks.reduce(
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

  const trackMap = yield* call(getTokenIdMap, {
    tracks: allTracks,
    ethCollectibles: account.collectibleList || [],
    solCollectibles: account.solanaCollectibleList || [],
    premiumTrackSignatureIdSet
  })
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
  const premiumContentSignatureMap: {
    [id: ID]: Nullable<PremiumContentSignature>
  } = {}

  if (premiumContentSignatureResponse) {
    // Set null for tracks for which signatures did not get returned
    // to signal that an attempt was made but the user does not have access.
    Object.keys(trackMap).forEach((trackId) => {
      const id = parseInt(trackId)
      if (!premiumContentSignatureResponse[id]) {
        premiumContentSignatureMap[id] = null
      }
    })

    // update premium content signatures
    yield* put(updatePremiumContentSignatures(premiumContentSignatureMap))

    // also update premium tracks' metadata with the newly obtained signature
    yield* put(
      cacheActions.update(
        Kind.TRACKS,
        Object.keys(premiumContentSignatureResponse).map((trackId) => {
          const id = parseInt(trackId)
          return {
            id,
            metadata: {
              // todo: remove below ts ignore
              // @ts-ignore
              premium_content_signature: premiumContentSignatureResponse[id]
            }
          }
        })
      )
    )
  }
}

const PREMIUM_TRACK_POLL_FREQUENCY = 5000

function* pollPremiumTrack({
  trackId,
  trackParams,
  frequency
}: {
  trackId: ID
  trackParams: TrackRouteParams
  frequency: number
}) {
  const { slug, handle } = trackParams ?? {}

  if (!slug || !handle) return

  while (true) {
    const premiumTrackSignatureMap = yield* select(getPremiumTrackSignatureMap)
    if (premiumTrackSignatureMap[trackId]) {
      yield* put(updatePremiumTrackStatus({ status: 'UNLOCKED' }))
      break
    }
    yield* put(trackPageActions.fetchTrack(null, slug, handle, false, true))
    yield* delay(frequency)
  }
}

function* refreshPremiumTrackAccess(
  action: ReturnType<typeof refreshPremiumTrack>
) {
  const { trackId, trackParams } = action.payload
  yield* call(pollPremiumTrack, {
    trackId,
    trackParams,
    frequency: PREMIUM_TRACK_POLL_FREQUENCY
  })
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

function* watchRefreshPremiumTrack() {
  yield* takeEvery(refreshPremiumTrack.type, refreshPremiumTrackAccess)
}

const sagas = () => {
  return [watchCollectibleGatedTracks, watchRefreshPremiumTrack]
}

export default sagas
