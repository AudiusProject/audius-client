import type { Collection, CommonState, User } from '@audius/common'
import {
  cacheCollectionsSelectors,
  accountSelectors,
  cacheTracksSelectors
} from '@audius/common'
import moment from 'moment'

import type { TrackForDownload } from 'app/components/offline-downloads'
import { store } from 'app/store'
import { getOfflineCollections } from 'app/store/offline-downloads/selectors'
import { populateCoverArtSizes } from 'app/utils/populateCoverArtSizes'

import { apiClient } from '../audius-api-client'

import {
  batchDownloadTrack,
  downloadCollection,
  downloadCollectionCoverArt,
  removeCollectionDownload
} from './offline-downloader'

const { getCollections } = cacheCollectionsSelectors
const { getAccountUser } = accountSelectors

/**
 * Favorites
 *  Check for new and removed track favorites
 *  Check for new and removed collections
 */
export const startSyncWorker = () => {
  const state = store.getState()
  // TODO: fetch all favorites, download new tracks and collections
  const collections = getCollections(state)
  const offlineCollections = Object.entries(getOfflineCollections(state))
    .filter(([id, isDownloaded]) => isDownloaded)
    .map(([id, isDownloaded]) => collections[id] ?? null)
    .filter((collection) => !!collection)

  offlineCollections.forEach((collection) => {
    syncCollection(collection)
  })
}

const syncCollection = async (
  offlineCollection: Collection,
  isFavoritesDownload?: boolean
) => {
  // TODO: record and check last verified time for collections
  const state = store.getState()
  const currentUserId = getAccountUser(state as unknown as CommonState)
  const collectionId = offlineCollection.playlist_id
  const collectionIdStr = offlineCollection.playlist_id.toString()
  // Fetch latest metadata
  const updatedCollection: Collection | undefined = (
    await apiClient.getPlaylist({
      playlistId: collectionId,
      currentUserId
    })
  )?.[0]

  // TODO: will discovery serve a removed playlist?
  if (!updatedCollection) return
  // Save metadata to cache and disk
  if (
    !moment(updatedCollection.updated_at).isAfter(offlineCollection.updated_at)
  ) {
    return
  }

  const updatedUser: User = (
    await apiClient.getUser({
      userId: updatedCollection.playlist_owner_id,
      currentUserId
    })
  )?.[0]
  let updatedUserCollection: Collection & { user: User } = {
    ...updatedCollection,
    user: updatedUser
  }
  updatedUserCollection =
    (await populateCoverArtSizes(updatedUserCollection)) ??
    updatedUserCollection

  downloadCollection(updatedUserCollection)
  if (
    updatedUserCollection.cover_art_sizes !== offlineCollection.cover_art_sizes
  ) {
    downloadCollectionCoverArt(updatedUserCollection)
  }

  const oldTrackIds = new Set(
    offlineCollection.tracks?.map((track) => track.track_id)
  )
  const newTrackIds = new Set(
    updatedCollection.tracks?.map((track) => track.track_id)
  )
  const addedTrackIds = [...newTrackIds].filter(
    (trackId) => !oldTrackIds.has(trackId)
  )
  const removedTrackIds = [...oldTrackIds].filter(
    (trackId) => !newTrackIds.has(trackId)
  )

  const tracksForDelete: TrackForDownload[] = removedTrackIds.map(
    (removedTrack) => ({
      trackId: removedTrack,
      downloadReason: {
        is_from_favorites: isFavoritesDownload,
        collection_id: collectionIdStr
      }
    })
  )
  removeCollectionDownload(collectionIdStr, tracksForDelete)

  const tracksForDownload: TrackForDownload[] = addedTrackIds.map(
    (addedTrack) => ({
      trackId: addedTrack,
      downloadReason: {
        is_from_favorites: isFavoritesDownload,
        collection_id: collectionIdStr
      }
    })
  )
  batchDownloadTrack(tracksForDownload, collectionIdStr)
}

const syncTrack = () => {
  // Fetch latest metadata
  // Save metadata to cache and disk
  // If cover_art_sizes changed, get latest cover art
  // Redownload audio?
}
