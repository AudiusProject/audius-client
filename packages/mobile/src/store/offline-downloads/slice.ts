import type { ID, OfflineTrackMetadata } from '@audius/common'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { TrackForDownload } from 'app/services/offline-downloader'

export type CollectionId = ID | string
type CollectionStatusPayload = {
  collectionId: CollectionId
  isFavoritesDownload?: boolean
}

type TrackDownloadReasonPayload = Pick<
  TrackForDownload,
  'trackId' | 'downloadReason'
>

export type OfflineDownloadsState = {
  downloadStatus: {
    [key: string]: OfflineDownloadStatus
  }
  collectionStatus: {
    [key: string]: OfflineDownloadStatus
  }
  favoritedCollectionStatus: {
    [key: string]: OfflineDownloadStatus
  }
  offlineTrackMetadata: {
    [key: string]: OfflineTrackMetadata
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
  offlineTrackMetadata: {},
  collectionStatus: {},
  favoritedCollectionStatus: {},
  isDoneLoadingFromDisk: false
}

const slice = createSlice({
  name: 'offlineDownloads',
  initialState,
  reducers: {
    // Queueing downloads
    batchInitDownload: (
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
    batchInitCollectionDownload: (
      state,
      {
        payload: { collectionIds, isFavoritesDownload }
      }: PayloadAction<{
        collectionIds: CollectionId[]
        isFavoritesDownload: boolean
      }>
    ) => {
      collectionIds.forEach((collectionId) => {
        state.collectionStatus[collectionId] = OfflineDownloadStatus.INIT
      })
    },
    startCollectionDownload: (
      state,
      action: PayloadAction<CollectionStatusPayload>
    ) => {
      const { collectionId, isFavoritesDownload } = action.payload
      const collectionStatus = isFavoritesDownload
        ? state.favoritedCollectionStatus
        : state.collectionStatus
      collectionStatus[collectionId] = OfflineDownloadStatus.LOADING
    },
    completeCollectionDownload: (
      state,
      action: PayloadAction<CollectionStatusPayload>
    ) => {
      const { collectionId, isFavoritesDownload } = action.payload
      const collectionStatus = isFavoritesDownload
        ? state.favoritedCollectionStatus
        : state.collectionStatus
      collectionStatus[collectionId] = OfflineDownloadStatus.SUCCESS
    },
    errorCollectionDownload: (
      state,
      action: PayloadAction<CollectionStatusPayload>
    ) => {
      const { collectionId, isFavoritesDownload } = action.payload
      const collectionStatus = isFavoritesDownload
        ? state.favoritedCollectionStatus
        : state.collectionStatus
      collectionStatus[collectionId] = OfflineDownloadStatus.ERROR
    },
    removeCollectionDownload: (
      state,
      action: PayloadAction<CollectionStatusPayload>
    ) => {
      const { collectionId, isFavoritesDownload } = action.payload
      const collectionStatus = isFavoritesDownload
        ? state.favoritedCollectionStatus
        : state.collectionStatus
      delete collectionStatus[collectionId]
    },
    addTrackOfflineMetadata: (
      state,
      action: PayloadAction<{
        trackId: number
        offlineMetadata: OfflineTrackMetadata
      }>
    ) => {
      const {
        payload: { trackId, offlineMetadata }
      } = action
      state.offlineTrackMetadata[trackId] = offlineMetadata
    },
    batchAddTrackDownloadReason: (
      state,
      action: PayloadAction<TrackDownloadReasonPayload[]>
    ) => {
      const { payload: tracksForDownload } = action
      tracksForDownload.forEach(({ trackId, downloadReason }) => {
        const existingReasons =
          state.offlineTrackMetadata[trackId].reasons_for_download ?? []
        if (
          // if it's not a new reason
          existingReasons.some(
            (existingReason) =>
              existingReason.collection_id === downloadReason.collection_id &&
              existingReason.is_from_favorites ===
                downloadReason.is_from_favorites
          )
        )
          return

        state.offlineTrackMetadata[trackId].reasons_for_download = [
          ...existingReasons,
          downloadReason
        ]
      })
    },
    batchRemoveTrackDownloadReason: (
      state,
      action: PayloadAction<TrackDownloadReasonPayload[]>
    ) => {
      const { payload: tracksForDownload } = action
      tracksForDownload.forEach(({ trackId, downloadReason }) => {
        const existingReasons =
          state.offlineTrackMetadata[trackId].reasons_for_download ?? []

        const updatedReasons = existingReasons.filter(
          (existingReason) =>
            existingReason.collection_id !== downloadReason.collection_id ||
            existingReason.is_from_favorites !==
              downloadReason.is_from_favorites
        )

        state.offlineTrackMetadata[trackId].reasons_for_download =
          updatedReasons
      })
    },
    unloadTrack: (state, { payload: trackId }: PayloadAction<string>) => {
      delete state.offlineTrackMetadata[trackId]
      delete state.downloadStatus[trackId]
    },
    unloadTracks: (state, { payload: trackIds }: PayloadAction<string[]>) => {
      trackIds.forEach((trackId) => {
        delete state.offlineTrackMetadata[trackId]
        delete state.downloadStatus[trackId]
      })
    },
    doneLoadingFromDisk: (state) => {
      state.isDoneLoadingFromDisk = true
    },
    clearOfflineDownloads: (state) => {
      state.collectionStatus = initialState.collectionStatus
      state.offlineTrackMetadata = initialState.offlineTrackMetadata
      state.downloadStatus = initialState.downloadStatus
      state.favoritedCollectionStatus = initialState.favoritedCollectionStatus
      state.isDoneLoadingFromDisk = initialState.isDoneLoadingFromDisk
    }
  }
})

export const {
  // TODO: don't name these the same thing
  batchInitDownload,
  startDownload,
  completeDownload,
  errorDownload,
  removeDownload,
  batchInitCollectionDownload,
  startCollectionDownload,
  completeCollectionDownload,
  errorCollectionDownload,
  removeCollectionDownload,
  unloadTrack,
  unloadTracks,
  doneLoadingFromDisk,
  clearOfflineDownloads
} = slice.actions
export const actions = slice.actions

export default slice.reducer
