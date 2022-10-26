import {
  ID,
  Collection,
  CollectionMetadata,
  UserCollectionMetadata,
  Kind,
  Track,
  makeUid,
  accountSelectors,
  cacheCollectionsSelectors,
  cacheSelectors,
  CommonState,
  getContext
} from '@audius/common'
import { call, select } from 'typed-redux-saga'

import { retrieve } from 'common/store/cache/sagas'
import { retrieveTracks } from 'common/store/cache/tracks/utils'
import { waitForBackendAndAccount } from 'utils/sagaHelpers'

import { addTracksFromCollections } from './addTracksFromCollections'
import { addUsersFromCollections } from './addUsersFromCollections'
import { reformat } from './reformat'
const { getEntryTimestamp } = cacheSelectors
const { getCollections } = cacheCollectionsSelectors
const getUserId = accountSelectors.getUserId

function* markCollectionDeleted(
  collectionMetadatas: CollectionMetadata[]
): Generator<any, CollectionMetadata[], any> {
  const collections = yield select(getCollections, {
    ids: collectionMetadatas.map((c) => c.playlist_id)
  })
  return collectionMetadatas.map((metadata) => {
    if (!(metadata.playlist_id in collections)) return metadata
    return {
      ...metadata,
      _marked_deleted: !!collections[metadata.playlist_id]._marked_deleted
    }
  })
}

export function* retrieveTracksForCollections(
  collections: CollectionMetadata[],
  excludedTrackIdSet: Set<ID>
) {
  const allTrackIds = collections.reduce((acc, cur) => {
    const trackIds = cur.playlist_contents.track_ids.map((t) => t.track)
    return [...acc, ...trackIds]
  }, [] as ID[])
  const filteredTrackIds = [
    ...new Set(allTrackIds.filter((id) => !excludedTrackIdSet.has(id)))
  ]
  const tracks: Track[] = yield call(retrieveTracks, {
    trackIds: filteredTrackIds
  })

  // If any tracks failed to be retrieved for some reason,
  // remove them from their collection.
  const unfetchedIdSet = new Set()
  for (let i = 0; i < tracks.length; i++) {
    if (!tracks[i]) {
      unfetchedIdSet.add(filteredTrackIds[i])
    }
  }

  return collections.map((c) => {
    // Filter out unfetched tracks
    const filteredIds = c.playlist_contents.track_ids.filter(
      (t) => !unfetchedIdSet.has(t.track)
    )
    // Add UIDs
    const withUids = filteredIds.map((t) => ({
      ...t,
      // Make a new UID if one doesn't already exist
      uid: t.uid || makeUid(Kind.TRACKS, t.track, `collection:${c.playlist_id}`)
    }))

    return {
      ...c,
      playlist_contents: {
        track_ids: withUids
      }
    }
  })
}

/**
 * Retrieves a single collection via API client
 */
export function* retrieveCollection(playlistId: ID) {
  yield* waitForBackendAndAccount()
  const apiClient = yield* getContext('apiClient')
  const userId = yield* select(getUserId)
  const playlists = yield* call([apiClient, 'getPlaylist'], {
    playlistId,
    currentUserId: userId
  })
  return playlists
}

/**
 * Retrieves collections from the cache or from source
 */
export function* retrieveCollections(
  // optional owner of collections to fetch (TODO: to be removed)
  userId: ID | null,
  // ids to retrieve
  collectionIds: ID[],
  // whether or not to fetch the tracks inside the playlist
  fetchTracks = false,
  /**  whether or not fetching this collection requires it to have all its tracks.
   * In the case where a collection is already cached with partial tracks, use this flag to refetch from source.
   */
  requiresAllTracks = false
) {
  // @ts-ignore retrieve should be refactored to ts first
  const { entries, uids } = yield call(retrieve, {
    ids: collectionIds,
    selectFromCache: function* (ids: ID[]) {
      const res: {
        [id: number]: Collection
      } = yield select(getCollections, { ids })
      if (requiresAllTracks) {
        const keys = Object.keys(res) as any
        keys.forEach((collectionId: number) => {
          const fullTrackCount = res[collectionId].track_count
          const currentTrackCount = res[collectionId].tracks?.length ?? 0
          if (currentTrackCount < fullTrackCount) {
            // Remove the collection from the res so retrieve knows to get it from source
            delete res[collectionId]
          }
        })
      }
      return res
    },
    getEntriesTimestamp: function* (ids: ID[]) {
      const selector = (state: CommonState, ids: ID[]) =>
        ids.reduce((acc, id) => {
          acc[id] = getEntryTimestamp(state, { kind: Kind.COLLECTIONS, id })
          return acc
        }, {} as { [id: number]: number | null })
      const selected: ReturnType<typeof selector> = yield select(selector, ids)
      return selected
    },
    retrieveFromSource: function* (ids: ID[]) {
      const audiusBackendInstance = yield* getContext('audiusBackendInstance')
      let metadatas: UserCollectionMetadata[]

      if (ids.length === 1) {
        metadatas = yield call(retrieveCollection, ids[0])
      } else {
        // TODO: Remove this branch when we have batched endpoints in new V1 api.
        metadatas = yield call(audiusBackendInstance.getPlaylists, userId, ids)
      }

      // Process any local deletions on the client
      const metadatasWithDeleted: UserCollectionMetadata[] = yield call(
        markCollectionDeleted,
        metadatas
      )

      return metadatasWithDeleted
    },
    onBeforeAddToCache: function* (metadatas: UserCollectionMetadata[]) {
      const audiusBackendInstance = yield* getContext('audiusBackendInstance')
      yield addUsersFromCollections(metadatas)
      yield addTracksFromCollections(metadatas)

      if (fetchTracks) {
        yield call(retrieveTracksForCollections, metadatas, new Set())
      }

      const reformattedCollections = metadatas.map((c) =>
        reformat(c, audiusBackendInstance)
      )

      return reformattedCollections
    },
    kind: Kind.COLLECTIONS,
    idField: 'playlist_id',
    forceRetrieveFromSource: false,
    shouldSetLoading: true,
    deleteExistingEntry: false
  })

  return { collections: entries, uids }
}
