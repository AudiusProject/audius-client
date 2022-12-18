import type {
  Collection,
  CommonState,
  User,
  DownloadReason
} from '@audius/common'
import {
  cacheCollectionsSelectors,
  accountSelectors,
  cacheTracksSelectors
} from '@audius/common'
import moment from 'moment'
import queue from 'react-native-job-queue'

import type { TrackForDownload } from 'app/components/offline-downloads'
import { fetchAllFavoritedTrackIds } from 'app/hooks/useFetchAllFavoritedTrackIds'
import { store } from 'app/store'
import { getOfflineCollections } from 'app/store/offline-downloads/selectors'
import type { OfflineDownloadsState } from 'app/store/offline-downloads/slice'
import { populateCoverArtSizes } from 'app/utils/populateCoverArtSizes'

import { apiClient } from '../audius-api-client'

import type { TrackDownloadWorkerPayload } from './offline-download-queue'
import { TRACK_DOWNLOAD_WORKER } from './offline-download-queue'
import {
  batchDownloadTrack,
  batchRemoveTrackDownload,
  downloadCollection,
  downloadCollectionCoverArt,
  DOWNLOAD_REASON_FAVORITES,
  removeCollectionDownload
} from './offline-downloader'

const { getCollections } = cacheCollectionsSelectors
const { getTracks } = cacheTracksSelectors
const { getUserId } = accountSelectors

/**
 * Favorites
 *  Check for new and removed track favorites
 *  Check for new and removed collections
 */
export const startSyncWorker = async () => {
  const state = store.getState()

  const collections = getCollections(state)
  const offlineCollectionsState = getOfflineCollections(state)
  if (offlineCollectionsState[DOWNLOAD_REASON_FAVORITES]) {
    await syncFavorites()
  }
  const offlineCollections = Object.entries(offlineCollectionsState)
    .filter(
      ([id, isDownloaded]) => isDownloaded && id !== DOWNLOAD_REASON_FAVORITES
    )
    .map(([id, isDownloaded]) => collections[id] ?? null)
    .filter((collection) => !!collection)

  offlineCollections.forEach((collection) => {
    // TODO: should we await this? Maybe race condition
    syncCollection(collection)
  })

  // TODO: check for individual stale tracks
}

const syncFavorites = async () => {
  const state = store.getState()

  const currentUserId = getUserId(state as unknown as CommonState)
  if (!currentUserId) return

  const favoritedTrackIds = await fetchAllFavoritedTrackIds(currentUserId)
  const cacheTracks: OfflineDownloadsState['tracks'] = getTracks(state, {})

  const isTrackFavoriteReason = (downloadReason: DownloadReason) =>
    downloadReason.is_from_favorites &&
    downloadReason.collection_id === DOWNLOAD_REASON_FAVORITES

  // TODO: should count tracks in download queue.
  const queuedTracks = (await queue.getJobs()).filter(
    ({ workerName, payload }) => {
      const parsedPayload: TrackDownloadWorkerPayload = JSON.parse(payload)
      const { downloadReason } = parsedPayload.trackForDownload
      return (
        workerName === TRACK_DOWNLOAD_WORKER &&
        isTrackFavoriteReason(downloadReason)
      )
    }
  )
  const cachedFavoritedTrackIds = Object.entries(cacheTracks)
    .filter(([id, track]) =>
      track.offline?.reasons_for_download.some(isTrackFavoriteReason)
    )
    .map(([id, track]) => track.track_id)

  const oldTrackIds = new Set([...queuedTracks, ...cachedFavoritedTrackIds])
  const newTrackIds = new Set(favoritedTrackIds)
  const addedTrackIds = [...newTrackIds].filter(
    (trackId) => !oldTrackIds.has(trackId)
  )
  const removedTrackIds = [...oldTrackIds].filter(
    (trackId) => !newTrackIds.has(trackId)
  )

  const tracksForDownload: TrackForDownload[] = addedTrackIds.map(
    (addedTrack) => ({
      trackId: addedTrack,
      downloadReason: {
        is_from_favorites: true,
        collection_id: DOWNLOAD_REASON_FAVORITES
      }
    })
  )
  batchDownloadTrack(tracksForDownload)

  const tracksForDelete: TrackForDownload[] = removedTrackIds.map(
    (removedTrack) => ({
      trackId: removedTrack,
      downloadReason: {
        is_from_favorites: true,
        collection_id: DOWNLOAD_REASON_FAVORITES
      }
    })
  )
  batchRemoveTrackDownload(tracksForDelete)
}

const syncCollection = async (
  offlineCollection: Collection,
  isFavoritesDownload?: boolean
) => {
  // TODO: record and check last verified time for collections
  const state = store.getState()
  const currentUserId = getUserId(state as unknown as CommonState)
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
  batchDownloadTrack(tracksForDownload)
}
