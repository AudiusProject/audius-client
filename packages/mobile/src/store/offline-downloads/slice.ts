import type {
  DownloadReason,
  ID,
  OfflineCollectionMetadata,
  OfflineTrackMetadata
} from '@audius/common'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'

import {
  addOfflineCollection,
  addOfflineTrack,
  removeOfflineCollection,
  removeOfflineTrack
} from './utils'

export type CollectionId = ID | string

type CollectionStatusPayload = {
  collectionId: CollectionId
}

export type TrackOfflineMetadataPayload = {
  trackId: ID
  offlineMetadata: OfflineTrackMetadata
}

export type DownloadQueueItem =
  | { type: 'collection'; id: ID }
  | { type: 'track'; id: ID }

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
  isDoneLoadingFromDisk: boolean
  downloadQueue: DownloadQueueItem[]
  queueStatus: QueueStatus
  offlineTrackMetadata: Record<ID, OfflineTrackMetadata>
  offlineCollectionMetadata: Record<ID, OfflineCollectionMetadata>
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

export type RequestRemoveDownloadedCollectionAction = PayloadAction<{
  collectionId: ID
}>

export type RequestRemoveFavoritedDownloadedCollectionAction = PayloadAction<{
  collectionId: ID
}>

export type OfflineItem =
  | { type: 'track'; id: ID; metadata: OfflineTrackMetadata }
  | {
      type: 'collection'
      id: CollectionId
      metadata: OfflineCollectionMetadata
    }

export type AddOfflineItemsAction = PayloadAction<{
  items: OfflineItem[]
}>

export type RemoveOfflineItemsAction = PayloadAction<{
  items: OfflineItem[]
}>

export type CollectionAction = PayloadAction<{
  collectionId: ID
}>

export type QueueAction = PayloadAction<DownloadQueueItem>

export type CompleteDownloadAction = PayloadAction<
  | { type: 'track'; id: ID; completedAt: number }
  | { type: 'collection'; id: ID }
>

export enum QueueStatus {
  IDLE = 'IDLE',
  PAUSED = 'PAUSED',
  PROCESSING = 'PROCESSING'
}

export type UpdateQueueStatusAction = PayloadAction<{
  queueStatus: QueueStatus
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
  collectionStatus: {},
  favoritedCollectionStatus: {},
  isDoneLoadingFromDisk: false,
  downloadQueue: [],
  queueStatus: QueueStatus.IDLE,
  offlineCollectionMetadata: {},
  offlineTrackMetadata: {}
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
        if (
          !state.downloadStatus[trackId] ||
          (state.downloadStatus[trackId] !== OfflineDownloadStatus.LOADING &&
            state.downloadStatus[trackId] !== OfflineDownloadStatus.SUCCESS)
        ) {
          state.downloadStatus[trackId] = OfflineDownloadStatus.INIT
        }
      })
    },
    // Actually starting the download
    startTrackDownload: (
      state,
      { payload: trackId }: PayloadAction<string>
    ) => {
      if (
        !state.downloadStatus[trackId] ||
        state.downloadStatus[trackId] !== OfflineDownloadStatus.SUCCESS
      ) {
        state.downloadStatus[trackId] = OfflineDownloadStatus.LOADING
      }
    },
    completeTrackDownload: (
      state,
      { payload: trackId }: PayloadAction<string>
    ) => {
      state.downloadStatus[trackId] = OfflineDownloadStatus.SUCCESS
    },
    errorTrackDownload: (
      state,
      { payload: trackId }: PayloadAction<string>
    ) => {
      if (
        !state.downloadStatus[trackId] ||
        state.downloadStatus[trackId] !== OfflineDownloadStatus.SUCCESS
      ) {
        state.downloadStatus[trackId] = OfflineDownloadStatus.ERROR
      }
    },
    removeDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      delete state.downloadStatus[trackId]
    },
    abandonDownload: (state, { payload: trackId }: PayloadAction<string>) => {
      if (
        !state.downloadStatus[trackId] ||
        state.downloadStatus[trackId] !== OfflineDownloadStatus.SUCCESS
      ) {
        state.downloadStatus[trackId] = OfflineDownloadStatus.ABANDONED
      }
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
      const { collectionId } = action.payload
      state.collectionStatus[collectionId] = OfflineDownloadStatus.LOADING
    },
    completeCollectionDownload: (
      state,
      action: PayloadAction<CollectionStatusPayload>
    ) => {
      const { collectionId } = action.payload
      state.collectionStatus[collectionId] = OfflineDownloadStatus.SUCCESS
      state.downloadQueue.shift()
    },
    errorCollectionDownload: (
      state,
      action: PayloadAction<CollectionStatusPayload>
    ) => {
      const { collectionId } = action.payload
      state.collectionStatus[collectionId] = OfflineDownloadStatus.ERROR
      state.downloadQueue.shift()
    },
    removeCollectionDownload: (
      state,
      action: PayloadAction<CollectionStatusPayload>
    ) => {
      const { collectionId } = action.payload
      delete state.collectionStatus[collectionId]
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
    addOfflineItems: (state, action: AddOfflineItemsAction) => {
      const { items } = action.payload
      const {
        offlineTrackMetadata,
        downloadStatus,
        downloadQueue,
        offlineCollectionMetadata,
        collectionStatus
      } = state
      for (const item of items) {
        if (item.type === 'track') {
          const { type, id, metadata } = item
          addOfflineTrack(offlineTrackMetadata, id, metadata)

          if (!downloadStatus[id]) {
            downloadStatus[id] = OfflineDownloadStatus.INIT
            downloadQueue.push({ type, id })
          }
        } else if (item.type === 'collection') {
          const { type, id, metadata } = item
          addOfflineCollection(offlineCollectionMetadata, id, metadata)

          if (!collectionStatus[id]) {
            collectionStatus[id] = OfflineDownloadStatus.INIT
            downloadQueue.push({ type, id })
          }
        }
      }
    },
    removeOfflineItems: (state, action: RemoveOfflineItemsAction) => {
      const { items } = action.payload
      const {
        offlineTrackMetadata,
        downloadStatus,
        downloadQueue,
        offlineCollectionMetadata,
        collectionStatus
      } = state

      for (const item of items) {
        if (item.type === 'track') {
          const { type, id, metadata } = item
          removeOfflineTrack(offlineTrackMetadata, id, metadata)

          if (!offlineTrackMetadata[id]) {
            delete downloadStatus[id]
            const queueIndex = downloadQueue.findIndex(
              (queueItem) => queueItem.type === type && queueItem.id === id
            )
            downloadQueue.splice(queueIndex, 1)
          }
        } else if (item.type === 'collection') {
          const { type, id, metadata } = item
          removeOfflineCollection(offlineCollectionMetadata, id, metadata)

          if (!offlineCollectionMetadata[id]) {
            delete collectionStatus[id]
            const queueIndex = downloadQueue.findIndex(
              (queueItem) => queueItem.type === type && queueItem.id === id
            )
            downloadQueue.splice(queueIndex, 1)
          }
        }
      }
    },
    downloadQueuedItem: () => {},
    startDownload: (state, action: QueueAction) => {
      const { type, id } = action.payload
      if (type === 'collection') {
        state.collectionStatus[id] = OfflineDownloadStatus.LOADING
      } else if (type === 'track') {
        state.downloadStatus[id] = OfflineDownloadStatus.LOADING
      }
    },
    completeDownload: (state, action: CompleteDownloadAction) => {
      const item = action.payload
      if (item.type === 'collection') {
        state.collectionStatus[item.id] = OfflineDownloadStatus.SUCCESS
      } else if (item.type === 'track') {
        const { id, completedAt } = item
        state.downloadStatus[id] = OfflineDownloadStatus.SUCCESS
        const trackMetadata = state.offlineTrackMetadata[id]
        trackMetadata.last_verified_time = completedAt
        trackMetadata.download_completed_time = completedAt
      }
      state.downloadQueue.shift()
    },
    errorDownload: (state, action: QueueAction) => {
      const { type, id } = action.payload
      if (type === 'collection') {
        state.collectionStatus[id] = OfflineDownloadStatus.ERROR
      } else if (type === 'track') {
        state.downloadStatus[id] = OfflineDownloadStatus.ERROR
      }
      state.downloadQueue.shift()
    },
    updateQueueStatus: (state, action: UpdateQueueStatusAction) => {
      state.queueStatus = action.payload.queueStatus
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
      state.downloadQueue = initialState.downloadQueue
      state.queueStatus = initialState.queueStatus
      state.offlineTrackMetadata = initialState.offlineTrackMetadata
      state.offlineCollectionMetadata = initialState.offlineCollectionMetadata
    },
    // Lifecycle actions that trigger complex saga flows
    requestDownloadAllFavorites: () => {},
    requestDownloadCollection: (_state, _action: CollectionAction) => {},
    requestDownloadFavoritedCollection: (
      _state,
      _action: CollectionAction
    ) => {},
    removeAllDownloadedFavorites: () => {},
    requestRemoveDownloadedCollection: (
      _state,
      _action: RequestRemoveDownloadedCollectionAction
    ) => {},
    requestRemoveFavoritedDownloadedCollection: (
      _state,
      _action: RequestRemoveDownloadedCollectionAction
    ) => {}
  }
})

export const {
  // TODO: don't name these the same thing
  batchInitDownload,
  startTrackDownload,
  completeTrackDownload,
  errorTrackDownload,
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
  addOfflineItems,
  removeOfflineItems,
  doneLoadingFromDisk,
  clearOfflineDownloads,
  requestDownloadAllFavorites,
  requestDownloadCollection,
  requestDownloadFavoritedCollection,
  removeAllDownloadedFavorites,
  requestRemoveDownloadedCollection,
  requestRemoveFavoritedDownloadedCollection,
  downloadQueuedItem,
  startDownload,
  completeDownload,
  errorDownload,
  updateQueueStatus
} = slice.actions
export const actions = slice.actions

const offlineDownloadsPersistConfig = {
  key: 'offline-downloads',
  storage: AsyncStorage,
  blacklist: [
    'tracks',
    'isDoneLoadingFromDisk',
    'favoritedCollectionStatus',
    'queueStatus'
  ]
}

const persistedOfflineDownloadsReducer = persistReducer(
  offlineDownloadsPersistConfig,
  slice.reducer
)

export default persistedOfflineDownloadsReducer
