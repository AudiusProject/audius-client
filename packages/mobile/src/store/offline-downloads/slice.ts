import type { ID, Track, UserTrackMetadata } from '@audius/common'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

type LineupTrack = Track & UserTrackMetadata

export type OfflineDownloadsState = {
  downloadStatus: {
    [key: string]: OfflineDownloadStatus
  }
  collectionStatus: {
    [key: string]: OfflineDownloadStatus
  }
  favoritedCollectionStatuss: {
    [key: string]: OfflineDownloadStatus
  }
  tracks: {
    [key: string]: LineupTrack
  }
  isDoneLoadingFromDisk: boolean
}

export enum OfflineDownloadStatus {
  INACTIVE = 'INACTIVE', // download is not initiated,
  INIT = 'INIT', // download is queued
  LOADING = 'LOADING', // download is in progress
  SUCCESS = 'SUCCESS', // download succeeded
  ERROR = 'ERROR' // download errored
}

const initialState: OfflineDownloadsState = {
  downloadStatus: {},
  tracks: {},
  collectionStatus: {},
  favoritedCollectionStatuss: {},
  isDoneLoadingFromDisk: false
}

const slice = createSlice({
  name: 'offlineDownloads',
  initialState,
  reducers: {
    // Queueing downloads
    batchStartDownload: (
      state,
      { payload: trackIds }: PayloadAction<string[]>
    ) => {
      trackIds.forEach((trackId) => {
        state.downloadStatus[trackId] = OfflineDownloadStatus.INIT
      })
    },
    // Actually starting the download
    startDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      state.downloadStatus[trackId] = OfflineDownloadStatus.LOADING
    },
    completeDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      state.downloadStatus[trackId] = OfflineDownloadStatus.SUCCESS
    },
    errorDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      state.downloadStatus[trackId] = OfflineDownloadStatus.ERROR
    },
    removeDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      delete state.downloadStatus[trackId]
    },
    batchStartCollectionDownload: (
      state,
      { payload: collectionIds }: PayloadAction<ID[]>
    ) => {
      collectionIds.forEach((collectionId) => {
        state.collectionStatus[collectionId] = OfflineDownloadStatus.INIT
      })
    },
    startCollectionDownload: (
      state,
      { payload: collectionId }: PayloadAction<ID>
    ) => {
      state.collectionStatus[collectionId] = OfflineDownloadStatus.LOADING
    },
    completeCollectionDownload: (
      state,
      { payload: collectionId }: PayloadAction<ID>
    ) => {
      state.collectionStatus[collectionId] = OfflineDownloadStatus.SUCCESS
    },
    errorCollectionDownload: (
      state,
      { payload: collectionId }: PayloadAction<ID>
    ) => {
      state.collectionStatus[collectionId] = OfflineDownloadStatus.ERROR
    },
    removeCollectionDownload: (
      state,
      { payload: collectionId }: PayloadAction<ID>
    ) => {
      delete state.collectionStatus[collectionId]
    },
    loadTracks: (state, { payload: tracks }: PayloadAction<LineupTrack[]>) => {
      tracks.forEach((track) => {
        const trackIdStr = track.track_id.toString()
        state.tracks[trackIdStr] = track
        state.downloadStatus[trackIdStr] = OfflineDownloadStatus.SUCCESS
      })
    },
    loadTrack: (state, { payload: track }: PayloadAction<LineupTrack>) => {
      const trackIdStr = track.track_id.toString()
      state.tracks[trackIdStr] = track
      state.downloadStatus[trackIdStr] = OfflineDownloadStatus.SUCCESS
    },
    unloadTrack: (state, { payload: trackId }: PayloadAction<string>) => {
      delete state.tracks[trackId]
      delete state.downloadStatus[trackId]
    },
    unloadTracks: (state, { payload: trackIds }: PayloadAction<string[]>) => {
      trackIds.forEach((trackId) => {
        delete state.tracks[trackId]
        delete state.downloadStatus[trackId]
      })
    },
    doneLoadingFromDisk: (state) => {
      state.isDoneLoadingFromDisk = true
    },
    clearOfflineDownloads: (state) => {
      state.collectionStatus = initialState.collectionStatus
      state.tracks = initialState.tracks
      state.downloadStatus = initialState.downloadStatus
      state.isDoneLoadingFromDisk = initialState.isDoneLoadingFromDisk
    }
  }
})

export const {
  startDownload,
  batchStartDownload,
  completeDownload,
  errorDownload,
  removeDownload,
  batchStartCollectionDownload,
  completeCollectionDownload,
  errorCollectionDownload,
  removeCollectionDownload,
  loadTracks,
  loadTrack,
  unloadTrack,
  unloadTracks,
  doneLoadingFromDisk,
  clearOfflineDownloads
} = slice.actions

export default slice.reducer
