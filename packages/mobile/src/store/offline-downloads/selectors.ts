import type { ID } from '@audius/common'

import type { AppState } from 'app/store'

import type { OfflineDownloadsState } from './slice'

export const getOfflineDownloadStatus = (state: AppState) =>
  state.offlineDownloads.downloadStatus

export const getTrackOfflineDownloadStatus =
  (trackId?: number) => (state: AppState) =>
    trackId ? state.offlineDownloads.downloadStatus[trackId] : null

export const getIsCollectionMarkedForDownload =
  (collectionId?: string | ID) => (state: AppState) =>
    !!(collectionId && state.offlineDownloads.collectionStatus[collectionId])

export const getOfflineTracks = (
  state: AppState
): OfflineDownloadsState['tracks'] => state.offlineDownloads.tracks

export const getOfflineCollections = (
  state: AppState
): OfflineDownloadsState['collectionStatus'] =>
  state.offlineDownloads.collectionStatus

export const getOfflineFavoritedCollections = (
  state: AppState
): OfflineDownloadsState['favoritedCollectionStatus'] =>
  state.offlineDownloads.favoritedCollectionStatus

export const getIsDoneLoadingFromDisk = (state: AppState): boolean =>
  state.offlineDownloads.isDoneLoadingFromDisk

export const getOfflineTrackMetadata = (state: AppState) =>
  state.offlineDownloads.offlineTrackMetadata

export const getOfflineCollectionMetadata = (state: AppState) =>
  state.offlineDownloads.offlineCollectionMetadata

export const getOfflineCollectionsStatus = (state: AppState) =>
  state.offlineDownloads.collectionStatus

export const getDownloadQueue = (state: AppState) =>
  state.offlineDownloads.downloadQueue

export const getQueueStatus = (state: AppState) =>
  state.offlineDownloads.queueStatus
