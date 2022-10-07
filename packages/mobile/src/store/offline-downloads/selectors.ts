import type { AppState } from 'app/store'

export const getTrackOfflineDownloadStatus =
  (trackId: string) => (state: AppState) =>
    state.offlineDownloads[trackId]
