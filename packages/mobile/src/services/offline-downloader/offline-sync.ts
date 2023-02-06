import type {
  Collection,
  CommonState,
  DownloadReason,
  UserCollectionMetadata
} from '@audius/common'
import { accountSelectors } from '@audius/common'
import moment from 'moment'
import queue from 'react-native-job-queue'

import { fetchAllFavoritedTracks } from 'app/hooks/useFetchAllFavoritedTracks'
import { store } from 'app/store'
import {
  getAllOfflineDownloadStatus,
  getAllOfflineTrackMetadata,
  getOfflineTracks
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { isAvailableForPlay } from 'app/utils/trackUtils'

import { apiClient } from '../audius-api-client'

import {
  batchDownloadCollection,
  batchDownloadTrack,
  batchRemoveTrackDownload,
  downloadCollectionCoverArt,
  downloadTrackCoverArt,
  DOWNLOAD_REASON_FAVORITES,
  removeCollectionDownload,
  removeDownloadedCollectionFromFavorites
} from './offline-downloader'
import { purgeDownloadedTrack, writeTrackJson } from './offline-storage'
import type { TrackForDownload } from './types'
import type { TrackDownloadWorkerPayload } from './workers/trackDownloadWorker'
import { TRACK_DOWNLOAD_WORKER } from './workers/trackDownloadWorker'

const { getUserId } = accountSelectors

const STALE_DURATION_TRACKS = moment.duration(7, 'days')

export const syncFavoritedTracks = async () => {
  const state = store.getState()

  const currentUserId = getUserId(state as unknown as CommonState)
  if (!currentUserId) return

  const favoritedTracks = await fetchAllFavoritedTracks(currentUserId)
  const offlineTrackMetadata = getAllOfflineTrackMetadata(state)

  const isTrackFavoriteReason = (downloadReason: DownloadReason) =>
    downloadReason.is_from_favorites &&
    downloadReason.collection_id === DOWNLOAD_REASON_FAVORITES

  const queuedTrackIds = (await queue.getJobs())
    .filter(({ workerName }) => workerName === TRACK_DOWNLOAD_WORKER)
    .map(({ payload }) => JSON.parse(payload) as TrackDownloadWorkerPayload)
    .filter(({ downloadReason }) => isTrackFavoriteReason(downloadReason))
    .map(({ trackId }) => trackId)
  const cachedFavoritedTrackIds = Object.entries(offlineTrackMetadata)
    .filter(([_id, trackOfflineMetadata]) =>
      trackOfflineMetadata.reasons_for_download.some(isTrackFavoriteReason)
    )
    .map(([id, _trackOfflineMetadata]) => id)
    .map(parseInt)

  const oldTrackIds = new Set([...queuedTrackIds, ...cachedFavoritedTrackIds])
  const newTrackIds = new Set(favoritedTracks.map(({ trackId }) => trackId))
  const addedTracks = [...favoritedTracks].filter(
    ({ trackId }) => !oldTrackIds.has(trackId)
  )
  const removedTrackIds = [...oldTrackIds].filter(
    (trackId) => !newTrackIds.has(trackId)
  )

  const tracksForDownload: TrackForDownload[] = addedTracks.map(
    (addedTrack) => ({
      trackId: addedTrack.trackId,
      downloadReason: {
        is_from_favorites: true,
        collection_id: DOWNLOAD_REASON_FAVORITES
      },
      favoriteCreatedAt: addedTrack.favoriteCreatedAt
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

export const syncFavoritedCollections = async (
  offlineCollections: Collection[],
  userCollections: Collection[]
) => {
  const oldCollectionIds = new Set(
    offlineCollections.map((collection) => collection.playlist_id)
  )
  const newCollectionIds = new Set(
    userCollections.map((collection) => collection.playlist_id)
  )
  const addedCollections = [...userCollections].filter(
    (collection) => !oldCollectionIds.has(collection.playlist_id)
  )
  const removedCollections = [...offlineCollections].filter(
    (collection) => !newCollectionIds.has(collection.playlist_id)
  )

  batchDownloadCollection(addedCollections, true)

  removedCollections.forEach((collection) => {
    const tracksForDownload =
      collection.tracks?.map((track) => ({
        trackId: track.track_id,
        downloadReason: {
          is_from_favorites: true,
          collection_id: collection.playlist_id?.toString()
        }
      })) ?? []

    removeDownloadedCollectionFromFavorites(
      collection.playlist_id,
      tracksForDownload
    )
  })
}

export const syncCollectionsTracks = async (
  collections: Collection[],
  isFavoritesDownload: boolean
) => {
  collections.forEach((collection) => {
    syncCollectionTracks(collection, isFavoritesDownload)
  })
}

export const syncCollectionTracks = async (
  offlineCollection: Collection,
  isFavoritesDownload: boolean
) => {
  const state = store.getState()
  const currentUserId = getUserId(state as unknown as CommonState)
  const trackDownloadStatus = getAllOfflineDownloadStatus(state)
  const collectionId = offlineCollection.playlist_id
  const collectionIdStr = offlineCollection.playlist_id.toString()
  const queuedTrackIds = (await queue.getJobs())
    .filter(({ workerName }) => workerName === TRACK_DOWNLOAD_WORKER)
    .map(({ payload }) => JSON.parse(payload) as TrackDownloadWorkerPayload)
    .filter(
      ({ downloadReason }) =>
        downloadReason.collection_id === collectionId.toString()
    )
    .map(({ trackId }) => trackId)

  const updatedCollection: UserCollectionMetadata | undefined = (
    await apiClient.getPlaylist({
      playlistId: collectionId,
      currentUserId
    })
  )?.[0]

  if (!updatedCollection) return

  const downloadedCollectionTrackIds =
    offlineCollection.tracks
      ?.map((track) => track.track_id)
      ?.filter(
        (trackId) =>
          // TODO: which statuses are most correct here?
          trackDownloadStatus[trackId] === OfflineDownloadStatus.SUCCESS ||
          trackDownloadStatus[trackId] === OfflineDownloadStatus.LOADING
      ) ?? []

  if (updatedCollection.is_delete) {
    removeCollectionDownload(
      collectionId,
      downloadedCollectionTrackIds.map((trackId) => ({
        trackId,
        downloadReason: {
          is_from_favorites: isFavoritesDownload,
          collection_id: collectionIdStr
        }
      }))
    )
    return
  }

  const downloadedOrQueuedCollectionTrackIds = new Set([
    ...downloadedCollectionTrackIds,
    ...queuedTrackIds
  ])
  const updatedCollectionTrackIds = new Set(
    updatedCollection.tracks?.map((track) => track.track_id)
  )

  const addedTrackIds = [...updatedCollectionTrackIds].filter(
    (trackId) => !downloadedOrQueuedCollectionTrackIds.has(trackId)
  )

  const removedTrackIds = [...downloadedOrQueuedCollectionTrackIds].filter(
    (trackId) => !updatedCollectionTrackIds.has(trackId)
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
  batchRemoveTrackDownload(tracksForDelete)

  // TODO: known bug here we should track multiple download reasons for the collection
  // and apply each download reason to the sync'd tracks.
  // Impact would be wrongly removing tracks when favorites toggle is turned off.
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

  // TODO: will discovery serve a removed playlist?
  if (!updatedCollection) return

  if (
    moment(updatedCollection.updated_at).isSameOrBefore(
      offlineCollection.updated_at
    )
  ) {
    return
  }

  batchDownloadCollection(
    [updatedCollection],
    isFavoritesDownload,
    /* skipTracks */ true
  )
  if (updatedCollection.cover_art_sizes !== offlineCollection.cover_art_sizes) {
    downloadCollectionCoverArt(updatedCollection)
  }
}

export const syncStaleTracks = () => {
  const state = store.getState()
  const downloadedTracks = getOfflineTracks(state)

  const currentUserId = getUserId(state as unknown as CommonState)
  if (!currentUserId) return

  const staleDownloadedTracks = downloadedTracks.filter(
    (track) =>
      track.offline &&
      moment()
        .subtract(STALE_DURATION_TRACKS)
        .isAfter(moment(track.offline?.last_verified_time))
  )

  staleDownloadedTracks.forEach(async (staleTrack) => {
    const updatedTrack = await apiClient.getTrack({
      id: staleTrack.track_id,
      currentUserId
    })

    if (!updatedTrack) return

    // If track should not be available
    if (!isAvailableForPlay(updatedTrack, currentUserId)) {
      purgeDownloadedTrack(staleTrack.track_id.toString())
      return
    }

    if (moment(updatedTrack.updated_at).isAfter(staleTrack.updated_at)) {
      if (updatedTrack.cover_art_sizes !== staleTrack.cover_art_sizes) {
        downloadTrackCoverArt(updatedTrack)
      }
    }

    // TODO: re-download the mp3 if it's changed
    const trackToWrite = {
      ...updatedTrack,
      offline: {
        download_completed_time:
          staleTrack.offline?.download_completed_time ?? Date.now(),
        reasons_for_download: staleTrack.offline?.reasons_for_download ?? [],
        last_verified_time: Date.now(),
        favorite_created_at: staleTrack.offline?.favorite_created_at
      }
    }
    writeTrackJson(updatedTrack.track_id.toString(), trackToWrite)
  })
}
