import type { ID, TrackMetadata } from '@audius/common'
import { removeNullable, cacheTracksSelectors } from '@audius/common'

import type { AppState } from 'app/store'

import type { OfflineDownloadsState } from './slice'
import { OfflineDownloadStatus } from './slice'
const { getTrack } = cacheTracksSelectors

export const getOfflineDownloadStatus = (state: AppState) =>
  state.offlineDownloads.downloadStatus

export const getTrackOfflineDownloadStatus =
  (trackId?: number) => (state: AppState) =>
    trackId ? state.offlineDownloads.downloadStatus[trackId] : null

export const getIsCollectionMarkedForDownload =
  (collectionId?: string | ID) => (state: AppState) =>
    !!(
      collectionId &&
      (state.offlineDownloads.collectionStatus[collectionId] ||
        state.offlineDownloads.favoritedCollectionStatus[collectionId])
    )

export const getTrackOfflineMetadata =
  (trackId?: number) => (state: AppState) =>
    trackId ? state.offlineDownloads.offlineTrackMetadata[trackId] : null

export const getTrackDownloadReasons =
  (trackId?: number) => (state: AppState) =>
    trackId
      ? state.offlineDownloads.offlineTrackMetadata[trackId]
          .reasons_for_download
      : []

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

// Computed Selectors

// Get ids for successfully downloaded tracks
export const getOfflineTrackIds = (state: AppState) =>
  Object.entries(state.offlineDownloads.downloadStatus)
    .filter(
      ([id, downloadStatus]) => downloadStatus === OfflineDownloadStatus.SUCCESS
    )
    .map(([id, downloadstatus]) => id)

export const getOfflineTrack =
  (trackId: ID) =>
  (state: AppState): TrackMetadata | null => {
    if (
      getTrackOfflineDownloadStatus(trackId)(state) !==
      OfflineDownloadStatus.SUCCESS
    )
      return null
    const track = getTrack(state, { id: trackId })
    if (!track) return null
    const offlineMetadata = getTrackOfflineMetadata(trackId)(state)
    return {
      ...track,
      offline: offlineMetadata || undefined
    }
  }

export const getOfflineTracks = (state: AppState): TrackMetadata[] => {
  const offlineTrackIds = getOfflineTrackIds(state)
  return offlineTrackIds
    .map((trackIdStr) => {
      const trackId = parseInt(trackIdStr)
      const track = getTrack(state, { id: trackId })
      if (!track) return null
      const offlineMetadata = getTrackOfflineMetadata(trackId)(state)
      return {
        ...track,
        offline: offlineMetadata || undefined
      }
    })
    .filter(removeNullable)
}
