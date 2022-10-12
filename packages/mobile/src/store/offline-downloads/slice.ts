import type { Track } from '@audius/common'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type OfflineDownloadsState = typeof initialState

type State = {
  downloadStatus: {
    [key: string]: TrackDownloadStatus
  }
  tracks: {
    [key: string]: Track
  }
}

export enum TrackDownloadStatus {
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

const initialState: State = {
  downloadStatus: {},
  tracks: {}
}

const slice = createSlice({
  name: 'offlineDownloads',
  initialState,
  reducers: {
    startDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      state.downloadStatus[trackId] = TrackDownloadStatus.LOADING
    },
    completeDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      state.downloadStatus[trackId] = TrackDownloadStatus.SUCCESS
    },
    errorDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      state.downloadStatus[trackId] = TrackDownloadStatus.SUCCESS
    },
    loadTracks: (state, { payload: tracks }: PayloadAction<Track[]>) => {
      tracks.forEach((track) => {
        state.tracks[track.track_id.toString()] = track
      })
    },
    loadTrack: (state, { payload: track }: PayloadAction<Track>) => {
      state.tracks[track.track_id.toString()] = track
    },
    unloadTrack: (state, { payload: trackId }: PayloadAction<string>) => {
      delete state.tracks[trackId]
    }
  }
})

export const {
  startDownload,
  completeDownload,
  errorDownload,
  loadTracks,
  loadTrack,
  unloadTrack
} = slice.actions

export default slice.reducer
