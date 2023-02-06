import type { DownloadReason, ID, OfflineTrackMetadata } from '@audius/common'
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

export type TrackOfflineMetadataPayload = {
  trackId: ID
  offlineMetadata: OfflineTrackMetadata
}

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

export type RemoveCollectionDownloadsAction = PayloadAction<{
  collectionIds: CollectionId[]
}>

export type CollectionReasonsToUpdate = {
  collectionId: CollectionId
  isFavoritesDownload: boolean
}

export type UpdateCollectionDownloadReasonsAction = PayloadAction<{
  reasons: CollectionReasonsToUpdate[]
}>

export type RemoveTrackDownloadsAction = PayloadAction<{
  trackIds: ID[]
}>

export type TrackReasonsToUpdate = {
  trackId: ID
  reasons_for_download: DownloadReason[]
}

export type UpdateTrackDownloadReasonsAction = PayloadAction<{
  reasons: TrackReasonsToUpdate[]
}>

export enum OfflineDownloadStatus {
  // download is not initiated
  INACTIVE = 'INACTIVE',
  // download is queued
  INIT = 'INIT',
  // download is in progress
  LOADING = 'LOADING',
  // download succeeded
  SUCCESS = 'SUCCESS',
  // download errored
  ERROR = 'ERROR',
  // download was abandoned (usually after error).
  // downloads in the error state can be retried
  ABANDONED = 'ABANDONED'
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
    abandonDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      state.downloadStatus[trackId] = OfflineDownloadStatus.ABANDONED
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
    updateCollectionDownloadReasons: (
      state,
      action: UpdateCollectionDownloadReasonsAction
    ) => {
      const { reasons } = action.payload
      reasons.forEach((reason) => {
        const { collectionId, isFavoritesDownload } = reason
        if (isFavoritesDownload) {
          delete state.collectionStatus[collectionId]
        } else {
          delete state.favoritedCollectionStatus[collectionId]
        }
      })
    },
    removeCollectionDownloads: (
      state,
      action: RemoveCollectionDownloadsAction
    ) => {
      const { collectionIds } = action.payload
      collectionIds.forEach((collectionId) => {
        delete state.favoritedCollectionStatus[collectionId]
        delete state.collectionStatus[collectionId]
      })
    },
    batchSetTrackOfflineMetadata: (
      state,
      action: PayloadAction<TrackOfflineMetadataPayload[]>
    ) => {
      const { payload: trackOfflineMetadatas } = action
      trackOfflineMetadatas.forEach((trackOfflineMetadata) => {
        const { trackId, offlineMetadata } = trackOfflineMetadata
        state.offlineTrackMetadata[trackId] = offlineMetadata
      })
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
    updateTrackDownloadReasons: (
      state,
      action: UpdateTrackDownloadReasonsAction
    ) => {
      const { reasons } = action.payload
      const { offlineTrackMetadata } = state

      reasons.forEach((reason) => {
        const { trackId, reasons_for_download } = reason
        const offlineMetadata = offlineTrackMetadata[trackId]

        offlineMetadata.reasons_for_download = reasons_for_download
      })
    },
    removeTrackDownloads: (state, action: RemoveTrackDownloadsAction) => {
      const { trackIds } = action.payload
      trackIds.forEach((trackId) => {
        delete state.offlineTrackMetadata[trackId]
        delete state.downloadStatus[trackId]
      })
    },
    doneLoadingFromDisk: (state) => {
      state.isDoneLoadingFromDisk = true
    },
    clearOfflineDownloads: (state) => {
      state.downloadStatus = initialState.downloadStatus
      state.collectionStatus = initialState.collectionStatus
      state.offlineTrackMetadata = initialState.offlineTrackMetadata
      state.downloadStatus = initialState.downloadStatus
      state.favoritedCollectionStatus = initialState.favoritedCollectionStatus
      state.isDoneLoadingFromDisk = initialState.isDoneLoadingFromDisk
    },
    // Lifecycle actions that trigger complex saga flows
    removeAllDownloadedFavorites: () => {}
  }
})

export const {
  // TODO: don't name these the same thing
  batchInitDownload,
  startDownload,
  completeDownload,
  errorDownload,
  abandonDownload,
  removeDownload,
  batchInitCollectionDownload,
  startCollectionDownload,
  completeCollectionDownload,
  errorCollectionDownload,
  updateCollectionDownloadReasons,
  removeCollectionDownload,
  removeCollectionDownloads,
  batchSetTrackOfflineMetadata,
  unloadTrack,
  updateTrackDownloadReasons,
  removeTrackDownloads,
  doneLoadingFromDisk,
  clearOfflineDownloads,
  removeAllDownloadedFavorites
} = slice.actions
export const actions = slice.actions

export default slice.reducer
