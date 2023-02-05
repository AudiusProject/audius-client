import type {
  DownloadReason,
  ID,
  OfflineCollectionMetadata,
  OfflineTrackMetadata,
  Track,
  UserTrackMetadata
} from '@audius/common'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'

import type {
  CollectionForDownload,
  TrackForDownload
} from 'app/services/offline-downloader'

import { getOfflineTrackMetadata } from './selectors'
import {
  addOfflineCollection,
  addOfflineTrack,
  removeOfflineCollection,
  removeOfflineTrack
} from './utils'

export type CollectionId = ID | string

type CollectionStatusPayload = {
  collectionId: CollectionId
  isFavoritesDownload?: boolean
}

type LineupTrack = Track & UserTrackMetadata

export type DownloadQueueItem = TrackForDownload | CollectionForDownload

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
  tracks: {
    [key: string]: LineupTrack
  }
  isDoneLoadingFromDisk: boolean
  downloadQueue: { type: 'collection' | 'track'; id: ID }[]
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

export type AddOfflineItemsAction = PayloadAction<{
  items: Array<
    | { type: 'track'; id: ID; metadata: OfflineTrackMetadata }
    | {
        type: 'collection'
        id: CollectionId
        metadata: OfflineCollectionMetadata
      }
  >
}>

export type RemoveOfflineItemsAction = PayloadAction<{
  items: Array<
    | { type: 'track'; id: ID; metadata: OfflineTrackMetadata }
    | {
        type: 'collection'
        id: CollectionId
        metadata: OfflineCollectionMetadata
      }
  >
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
  tracks: {},
  collectionStatus: {},
  favoritedCollectionStatus: {},
  isDoneLoadingFromDisk: false,
  downloadQueue: [],
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
    updateTrackDownloadReasons: (
      state,
      action: UpdateTrackDownloadReasonsAction
    ) => {
      const { reasons } = action.payload
      const { tracks } = state

      reasons.forEach((reason) => {
        const { trackId, reasons_for_download } = reason
        const track = tracks[trackId]
        const { offline } = track

        if (offline) {
          offline.reasons_for_download = reasons_for_download
        }
      })
    },
    removeTrackDownloads: (state, action: RemoveTrackDownloadsAction) => {
      const { trackIds } = action.payload
      trackIds.forEach((trackId) => {
        delete state.tracks[trackId]
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
    doneLoadingFromDisk: (state) => {
      state.isDoneLoadingFromDisk = true
    },
    clearOfflineDownloads: (state) => {
      state.collectionStatus = initialState.collectionStatus
      state.tracks = initialState.tracks
      state.downloadStatus = initialState.downloadStatus
      state.isDoneLoadingFromDisk = initialState.isDoneLoadingFromDisk
      state.downloadQueue = initialState.downloadQueue
      state.offlineTrackMetadata = initialState.offlineTrackMetadata
      state.offlineCollectionMetadata = initialState.offlineCollectionMetadata
    },
    // Lifecycle actions that trigger complex saga flows
    requestDownloadAllFavorites: () => {},
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
  loadTracks,
  loadTrack,
  unloadTrack,
  updateTrackDownloadReasons,
  removeTrackDownloads,
  addOfflineItems,
  removeOfflineItems,
  doneLoadingFromDisk,
  clearOfflineDownloads,
  requestDownloadAllFavorites,
  removeAllDownloadedFavorites,
  requestRemoveDownloadedCollection,
  requestRemoveFavoritedDownloadedCollection
} = slice.actions
export const actions = slice.actions

const offlineDownloadsPersistConfig = {
  key: 'offline-downloads',
  storage: AsyncStorage,
  blacklist: ['tracks', 'isDoneLoadingFromDisk']
}

const persistedOfflineDownloadsReducer = persistReducer(
  offlineDownloadsPersistConfig,
  slice.reducer
)

export default persistedOfflineDownloadsReducer
