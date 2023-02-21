import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { Collection } from 'models/Collection'
import { Status } from 'models/Status'

import {
  AddCollectionsAction,
  AddTrackToPlaylistAction,
  AddCollectionUidsAction,
  CollectionsState,
  CreatePlaylistAction,
  CreatePlaylistFailedAction,
  DeletePlaylistAction,
  DeletePlaylistFailedAction,
  EditPlaylistAction,
  EditPlaylistFailedAction,
  FetchCollectionCoverArtAction,
  PublishPlaylistAction,
  PublishPlaylistFailedAction,
  RemoveTrackFromPlaylistAction,
  RemoveTrackFromPlaylistFailedAction,
  AddTrackToPlaylistFailedAction,
  OrderPlaylistAction,
  OrderPlaylistFailedAction
} from './types'

export const collectionsAdapter = createEntityAdapter<Collection>({
  selectId: (collection) => collection.playlist_id
})

const initialState: CollectionsState = {
  ...collectionsAdapter.getInitialState(),
  timestamps: {},
  permalinks: {},
  statuses: {},
  uids: {}
}

const slice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    addCollections: (state, action: AddCollectionsAction) => {
      const { collections, uids } = action.payload
      collectionsAdapter.addMany(state, collections)
      Object.assign(state.uids, uids)

      const now = Date.now()
      for (const collection of collections) {
        const { playlist_id, permalink } = collection
        state.permalinks[permalink.toLowerCase()] = playlist_id
        state.timestamps[playlist_id] = now
        state.statuses[playlist_id] = Status.SUCCESS
      }
    },
    updateCollection: collectionsAdapter.updateOne,
    updateCollections: collectionsAdapter.updateMany,
    removeCollection: collectionsAdapter.removeOne,
    addUids: (state, action: AddCollectionUidsAction) => {
      const { uids } = action.payload
      for (const { id, uid } of uids) {
        state.uids[uid] = id
      }
    },
    fetchCoverArt: (_state, _action: FetchCollectionCoverArtAction) => {},
    createPlaylist: (_state, _action: CreatePlaylistAction) => {},
    createPlaylistRequested: () => {},
    createPlaylistSucceeded: () => {},
    createPlaylistFailed: (_state, _action: CreatePlaylistFailedAction) => {},
    publishPlaylist: (_state, _action: PublishPlaylistAction) => {},
    publishPlaylistFailed: (_state, _action: PublishPlaylistFailedAction) => {},
    editPlaylist: (_state, _action: EditPlaylistAction) => {},
    editPlaylistSucceeded: () => {},
    editPlaylistFailed: (_state, _action: EditPlaylistFailedAction) => {},
    orderPlaylist: (_state, _action: OrderPlaylistAction) => {},
    orderPlaylistFailed: (_state, _action: OrderPlaylistFailedAction) => {},
    deletePlaylist: (_state, _action: DeletePlaylistAction) => {},
    deletePlaylistRequested: () => {},
    deletePlaylistSucceeded: () => {},
    deletePlaylistFailed: (_state, _action: DeletePlaylistFailedAction) => {},
    addTrackToPlaylist: (_state, _action: AddTrackToPlaylistAction) => {},
    addTrackToPlaylistFailed: (
      _state,
      _action: AddTrackToPlaylistFailedAction
    ) => {},
    removeTrackFromPlaylist: (
      _state,
      _action: RemoveTrackFromPlaylistAction
    ) => {},
    removeTrackFromPlaylistFailed: (
      _state,
      _action: RemoveTrackFromPlaylistFailedAction
    ) => {}
  }
})

const reducer = slice.reducer
const { ...actions } = slice.actions

export { actions }
export default reducer
