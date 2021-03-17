import { call, select } from 'redux-saga/effects'
import { Kind, AppState } from 'store/types'
import { ID } from 'models/common/Identifiers'
import { getCollections } from 'store/cache/collections/selectors'
import { retrieve } from 'store/cache/sagas'
import { getEntryTimestamp } from 'store/cache/selectors'
import AudiusBackend from 'services/AudiusBackend'
import { CollectionMetadata, UserCollectionMetadata } from 'models/Collection'
import { reformat } from './reformat'
import { retrieveTracks } from 'store/cache/tracks/utils'
import { addUsersFromCollections } from './addUsersFromCollections'
import { makeUid } from 'utils/uid'
import { addTracksFromCollections } from './addTracksFromCollections'
import { getUserId } from 'store/account/selectors'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import Track from 'models/Track'

function* markCollectionDeleted(
  collectionMetadatas: CollectionMetadata[]
): Generator<any, CollectionMetadata[], any> {
  const collections = yield select(getCollections, {
    ids: collectionMetadatas.map(c => c.playlist_id)
  })
  return collectionMetadatas.map(metadata => {
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
    const trackIds = cur.playlist_contents.track_ids.map(t => t.track)
    return [...acc, ...trackIds]
  }, [] as ID[])
  const filteredTrackIds = [
    ...new Set(allTrackIds.filter(id => !excludedTrackIdSet.has(id)))
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

  return collections.map(c => {
    // Filter out unfetched tracks
    const filteredIds = c.playlist_contents.track_ids.filter(
      t => !unfetchedIdSet.has(t.track)
    )
    // Add UIDs
    const withUids = filteredIds.map(t => ({
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
 * @param playlistId
 */
function* retrieveCollection(playlistId: ID) {
  const userId: ReturnType<typeof getUserId> = yield select(getUserId)
  const playlists: UserCollectionMetadata[] = yield apiClient.getPlaylist({
    playlistId,
    currentUserId: userId
  })
  return playlists
}

export function* retrieveCollections(
  userId: ID | null,
  collectionIds: ID[],
  fetchTracks = false
) {
  const { entries, uids } = yield call(retrieve, {
    ids: collectionIds,
    selectFromCache: function* (ids: ID[]) {
      const res: ReturnType<typeof getCollections> = yield select(
        getCollections,
        { ids }
      )
      return res
    },
    getEntriesTimestamp: function* (ids: ID[]) {
      const selector = (state: AppState, ids: ID[]) =>
        ids.reduce((acc, id) => {
          acc[id] = getEntryTimestamp(state, { kind: Kind.COLLECTIONS, id })
          return acc
        }, {} as { [id: number]: number | null })
      const selected: ReturnType<typeof selector> = yield select(selector, ids)
      return selected
    },
    retrieveFromSource: function* (ids: ID[]) {
      let metadatas: UserCollectionMetadata[]

      if (ids.length === 1) {
        metadatas = yield call(retrieveCollection, ids[0])
      } else {
        // TODO: Remove this branch when we have batched endpoints in new V1 api.
        metadatas = yield call(AudiusBackend.getPlaylists, userId, ids)
      }

      // Process any local deletions on the client
      const metadatasWithDeleted: UserCollectionMetadata[] = yield call(
        markCollectionDeleted,
        metadatas
      )

      return metadatasWithDeleted
    },
    onBeforeAddToCache: function* (metadatas: UserCollectionMetadata[]) {
      yield addUsersFromCollections(metadatas)
      yield addTracksFromCollections(metadatas)

      if (fetchTracks) {
        yield call(retrieveTracksForCollections, metadatas, new Set())
      }

      const reformattedCollections = metadatas.map(c => reformat(c))

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
