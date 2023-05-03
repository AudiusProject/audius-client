import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Status } from '../../models/Status'

import {
  FetchCollectionsFailedPayload,
  FetchCollectionsPayload,
  FetchCollectionsSucceededPayload
} from './types'

// TODO: Do we need a tracking index for each type to know when we've hit the end?
export type CollectionListState = {
  status: Status
}

export type SavedCollectionsState = {
  albums: CollectionListState
  playlists: CollectionListState
}

const initialState: SavedCollectionsState = {
  albums: {
    status: Status.IDLE
  },
  playlists: {
    status: Status.IDLE
  }
}

const slice = createSlice({
  name: 'saved-collections',
  initialState,
  reducers: {
    // TODO: Use a begin action to prevent multiple in flight?
    fetchCollections: (
      state,
      action: PayloadAction<FetchCollectionsPayload>
    ) => {
      state[action.payload.type].status = Status.LOADING
    },
    fetchCollectionsSucceeded: (
      state,
      action: PayloadAction<FetchCollectionsSucceededPayload>
    ) => {
      const list = state[action.payload.type]
      list.status = Status.SUCCESS
    },
    fetchCollectionsFailed: (
      state,
      action: PayloadAction<FetchCollectionsFailedPayload>
    ) => {
      // TODO: message
      state[action.payload.type].status = Status.ERROR
    }
  }
})

export const {
  fetchCollections,
  fetchCollectionsSucceeded,
  fetchCollectionsFailed
} = slice.actions

export const actions = slice.actions
export default slice.reducer
