import type {
  Collection,
  CommonState,
  User,
  DownloadReason,
  UserTrackMetadata
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
import { purgeDownloadedTrack, writeTrackJson } from './offline-storage'

const { getCollections } = cacheCollectionsSelectors
const { getTracks } = cacheTracksSelectors
const { getUserId } = accountSelectors

// const STALE_DURATION_TRACKS = moment.duration(7, 'days')
const STALE_DURATION_TRACKS = moment.duration(7, 'seconds')

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

  syncStaleTracks()
}

const syncFavorites = async () => {
  const state = store.getState()

  const currentUserId = getUserId(state as unknown as CommonState)
  if (!currentUserId) return

  const favoritedTrackIds = await fetchAllFavoritedTrackIds(currentUserId)
  const cacheTracks = getTracks(state, {})

  const isTrackFavoriteReason = (downloadReason: DownloadReason) =>
    downloadReason.is_from_favorites &&
    downloadReason.collection_id === DOWNLOAD_REASON_FAVORITES

  // TODO: should count tracks in download queue.
  const queuedTracks = (await queue.getJobs())
    .filter(({ workerName }) => workerName === TRACK_DOWNLOAD_WORKER)
    .map(({ payload }) => JSON.parse(payload) as TrackDownloadWorkerPayload)
    .filter(({ trackForDownload }) =>
      isTrackFavoriteReason(trackForDownload.downloadReason)
    )
    .map(({ trackForDownload: { trackId } }) => trackId)
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

const syncStaleTracks = () => {
  const state = store.getState()
  const cacheTracks = getTracks(state, {})
  const currentUserId = getUserId(state as unknown as CommonState)
  if (!currentUserId) return

  const staleCachedTracks = Object.entries(cacheTracks)
    .filter(
      ([id, track]) =>
        track.offline &&
        moment()
          .subtract(STALE_DURATION_TRACKS)
          .isAfter(moment(track.offline?.last_verified_time))
    )
    .map(([id, track]) => track)

  staleCachedTracks.forEach(async (staleTrack) => {
    const updatedTrack: UserTrackMetadata = await apiClient.getTrack({
      id: staleTrack.track_id,
      currentUserId
    })

    // If track should not be available
    if (
      !updatedTrack.is_available ||
      updatedTrack.is_delete ||
      updatedTrack.is_invalid ||
      (updatedTrack.is_unlisted && updatedTrack.owner_id !== currentUserId)
    ) {
      purgeDownloadedTrack(staleTrack.track_id.toString())
      return
    }

    writeTrackJson(updatedTrack.track_id.toString(), {
      ...updatedTrack,
      offline: {
        download_completed_time:
          staleTrack.offline?.download_completed_time ?? Date.now(),
        reasons_for_download: staleTrack.offline?.reasons_for_download ?? [],
        last_verified_time: Date.now()
      }
    })
  })
}
