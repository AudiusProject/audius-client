import { Status } from 'store/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ID } from 'models/common/Identifiers'
import { keyBy } from 'lodash'

const initialState = {
  collections: {} as { [id: number]: AccountCollection },
  // Used to track the ordering of playlists in the user's left nav
  // Array of strings that are either smart collection identifiers or user-generated collection ids
  orderedPlaylists: [] as string[],
  userId: null as number | null,
  status: Status.LOADING,
  hasFavoritedItem: false,
  connectivityFailure: false, // Did we fail from no internet connectivity?
  needsAccountRecovery: false
}

export type AccountCollection = {
  id: ID
  name: string
  is_album: boolean
  user: { id: ID; handle: string }
}

type FetchAccountSucceededPayload = {
  userId: ID
  collections: AccountCollection[]
  orderedPlaylists: string[]
  hasFavoritedItem: boolean
}

type RenameAccountPlaylistPayload = {
  collectionId: ID
  name: string
}

const slice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    fetchAccount: () => {},
    fetchAccountRequested: state => {
      state.status = Status.LOADING
    },
    fetchAccountSucceeded: (
      state,
      action: PayloadAction<FetchAccountSucceededPayload>
    ) => {
      const {
        userId,
        orderedPlaylists,
        collections,
        hasFavoritedItem
      } = action.payload
      state.userId = userId
      state.orderedPlaylists = orderedPlaylists
      state.collections = keyBy(collections, 'id')
      state.status = Status.SUCCESS
      state.hasFavoritedItem = hasFavoritedItem
    },
    fetchAccountFailed: state => {
      state.status = Status.ERROR
    },
    fetchAccountNoInternet: state => {
      state.connectivityFailure = true
    },
    setReachable: state => {
      state.connectivityFailure = false
    },
    addAccountPlaylist: (state, action: PayloadAction<AccountCollection>) => {
      state.collections[action.payload.id] = action.payload
    },
    removeAccountPlaylist: (
      state,
      action: PayloadAction<{ collectionId: ID }>
    ) => {
      const { collectionId } = action.payload
      delete state.collections[collectionId]
    },
    renameAccountPlaylist: (
      state,
      action: PayloadAction<RenameAccountPlaylistPayload>
    ) => {
      const { collectionId, name } = action.payload
      state.collections[collectionId].name = name
    },
    fetchSavedAlbums: () => {},
    fetchSavedAlbumsSucceeded: (
      state,
      action: PayloadAction<{ collections: AccountCollection[] }>
    ) => {
      const { collections } = action.payload

      state.collections = {
        ...state.collections,
        ...keyBy(collections, 'id')
      }
    },
    fetchSavedPlaylists: () => {},
    fetchSavedPlaylistsSucceeded: (
      state,
      action: PayloadAction<{ collections: AccountCollection[] }>
    ) => {
      const { collections } = action.payload

      state.collections = {
        ...state.collections,
        ...keyBy(collections, 'id')
      }
    },
    didFavoriteItem: state => {
      state.hasFavoritedItem = true
    },
    setNeedsAccountRecovery: state => {
      state.needsAccountRecovery = true
    },
    setPlaylistOrder: (state, action: PayloadAction<{ order: string[] }>) => {
      const { order } = action.payload
      state.orderedPlaylists = order
    },
    fetchBrowserPushNotifications: () => {},
    subscribeBrowserPushNotifications: () => {},
    unsubscribeBrowserPushNotifications: () => {},
    twitterLogin: (
      state,
      action: PayloadAction<{ uuid: string; profile: any }>
    ) => {},
    showPushNotificationConfirmation: () => {}
  }
})

export const {
  fetchAccount,
  fetchAccountRequested,
  fetchAccountSucceeded,
  fetchAccountFailed,
  fetchAccountNoInternet,
  setReachable,
  addAccountPlaylist,
  removeAccountPlaylist,
  renameAccountPlaylist,
  fetchSavedAlbums,
  fetchSavedAlbumsSucceeded,
  fetchSavedPlaylists,
  fetchSavedPlaylistsSucceeded,
  didFavoriteItem,
  setNeedsAccountRecovery,
  setPlaylistOrder,
  fetchBrowserPushNotifications,
  subscribeBrowserPushNotifications,
  unsubscribeBrowserPushNotifications,
  twitterLogin,
  showPushNotificationConfirmation
} = slice.actions

export default slice.reducer
