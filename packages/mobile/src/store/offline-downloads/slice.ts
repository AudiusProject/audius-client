import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type OfflineDownloadsState = typeof initialState

type State = {
  tracks: {
    [key: string]: TrackDownloadStatus
  }
}

export enum TrackDownloadStatus {
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

const initialState: State = {
  tracks: {}
}

const slice = createSlice({
  name: 'offlineDownloads',
  initialState,
  reducers: {
    startDownload: (state, action: PayloadAction<string>) => {
      state[action.payload] = TrackDownloadStatus.LOADING
    },
    completeDownload: (state, action: PayloadAction<string>) => {
      state[action.payload] = TrackDownloadStatus.SUCCESS
    },
    errorDownload: (state, action: PayloadAction<string>) => {
      state[action.payload] = TrackDownloadStatus.SUCCESS
    }
  }
})

export const { startDownload, completeDownload, errorDownload } = slice.actions

export default slice.reducer
