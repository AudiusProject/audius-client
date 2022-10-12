import type { AppState } from 'app/store'

export const getTrackOfflineDownloadStatus =
  (trackId: string) => (state: AppState) =>
    state.offlineDownloads.downloadStatus[trackId]

export const getOfflineTracks = (state: AppState) =>
  state.offlineDownloads.tracks
