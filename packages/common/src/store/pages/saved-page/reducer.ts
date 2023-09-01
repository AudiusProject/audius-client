// @ts-nocheck
// TODO(nkang) - convert to TS
import { ID } from 'models/Identifiers'
import { asLineup } from 'store/lineup/reducer'
import {
  FETCH_SAVES,
  FETCH_SAVES_REQUESTED,
  FETCH_SAVES_SUCCEEDED,
  FETCH_SAVES_FAILED,
  FETCH_MORE_SAVES,
  FETCH_MORE_SAVES_SUCCEEDED,
  FETCH_MORE_SAVES_FAILED,
  ADD_LOCAL_TRACK_REPOST,
  REMOVE_LOCAL_TRACK_REPOST,
  ADD_LOCAL_TRACK_PURCHASE,
  ADD_LOCAL_COLLECTION_FAVORITE,
  ADD_LOCAL_COLLECTION_REPOST,
  REMOVE_LOCAL_COLLECTION_FAVORITE,
  REMOVE_LOCAL_COLLECTION_REPOST,
  ADD_LOCAL_TRACK_FAVORITE,
  REMOVE_LOCAL_TRACK_FAVORITE,
  END_FETCHING,
  SET_SELECTED_CATEGORY
} from 'store/pages/saved-page/actions'
import tracksReducer, {
  initialState as initialLineupState
} from 'store/pages/saved-page/lineups/tracks/reducer'
import { signOut } from 'store/sign-out/slice'
import { ActionsMap } from 'utils/reducer'

import { PREFIX as tracksPrefix } from './lineups/tracks/actions'
import { LibraryCategory, LibraryCategoryType, SavedPageState } from './types'

const initialState = {
  // id => uid
  localTrackFavorites: {},
  localTrackPurchases: {},
  localTrackReposts: {},
  localAlbumFavorites: [],
  localAlbumPurchases: [],
  localAlbumReposts: [],
  localRemovedAlbumFavorites: [],
  localRemovedAlbumReposts: [],
  localPlaylistFavorites: [],
  localPlaylistReposts: [],
  localPlaylistPurchases: [],
  localRemovedPlaylistFavorites: [],
  localRemovedPlaylistResposts: [],
  trackSaves: [],
  initialFetch: false,
  hasReachedEnd: false,
  fetchingMore: false,
  tracks: initialLineupState,
  selectedCategory: LibraryCategory.Favorite
} as SavedPageState

/** Utility to get the name of key in which locally added or removed collections are stored in SavedPageState.
 * For example, playlists that are favorited/unfavorited locally go into `localPlaylistFavorites`/`localPlaylistRemovedFavorites`.
 */
const getLocalCollectionStateKeys = ({
  isAlbum,
  type
}: {
  isAlbum: boolean
  type: Omit<LibraryCategoryType, 'All'>
}) => {
  let categoryKeySuffix
  if (type === 'favorite') {
    categoryKeySuffix = 'Favorites'
  } else if (type === 'repost') {
    categoryKeySuffix = 'Reposts'
  } else if (type === 'purchase') {
    categoryKeySuffix = 'Purchases'
  }
  const additionKey = (
    isAlbum
      ? `localAlbum${categoryKeySuffix}`
      : `localPlaylist${categoryKeySuffix}`
  ) as keyof SavedPageState
  const removalKey = (
    isAlbum
      ? `localAlbumRemoved${categoryKeySuffix}`
      : `localPlaylistRemoved${categoryKeySuffix}`
  ) as keyof SavedPageState
  return { additionKey, removalKey }
}

const removeCollectionLocally = ({
  state,
  action,
  type
}: {
  state: SavedPageState
  action: { collectionId: ID; isAlbum: boolean }
  type: Omit<LibraryCategoryType, 'All'>
}) => {
  const { additionKey, removalKey } = getLocalCollectionStateKeys({
    isAlbum: action.isAlbum,
    type
  })
  return {
    ...state,
    [additionKey]: (state[additionKey] as ID[]).filter(
      (id) => id !== action.collectionId
    ),
    [removalKey]: [action.collectionId, ...(state[removalKey] as ID[])]
  }
}

const addCollectionLocally = ({
  state,
  action,
  type
}: {
  state: SavedPageState
  action: { collectionId: ID; isAlbum: boolean }
  type: 'repost' | 'favorite'
}) => {
  const { additionKey, removalKey } = getLocalCollectionStateKeys({
    isAlbum: action.isAlbum,
    type
  })
  return {
    ...state,
    [additionKey]: [action.collectionId, ...(state[additionKey] as ID[])],
    [removalKey]: (state[removalKey] as ID[]).filter(
      (id) => id !== action.collectionId
    )
  }
}

const actionsMap: ActionsMap<SavedPageState> = {
  [FETCH_SAVES](state) {
    return {
      ...state
    }
  },
  [FETCH_SAVES_REQUESTED](state) {
    return {
      ...state,
      initialFetch: true,
      hasReachedEnd: false
    }
  },
  [FETCH_SAVES_SUCCEEDED](state, action) {
    return {
      ...state,
      trackSaves: action.saves,
      initialFetch: false
    }
  },
  [FETCH_MORE_SAVES](state) {
    return {
      ...state,
      fetchingMore: true
    }
  },
  [FETCH_SAVES_FAILED](state) {
    return {
      ...state,
      fetchingMore: false,
      trackSaves: []
    }
  },
  [FETCH_MORE_SAVES_SUCCEEDED](state, action) {
    const savesCopy = state.trackSaves.slice()
    savesCopy.splice(action.offset, action.saves.length, ...action.saves)

    return {
      ...state,
      fetchingMore: false,
      trackSaves: savesCopy
    }
  },
  [FETCH_MORE_SAVES_FAILED](state) {
    return { ...state }
  },
  [END_FETCHING](state, action) {
    const savesCopy = state.trackSaves.slice(0, action.endIndex)
    return {
      ...state,
      trackSaves: savesCopy,
      hasReachedEnd: true
    }
  },
  [ADD_LOCAL_TRACK_FAVORITE](state, action) {
    return {
      ...state,
      localTrackFavorites: {
        ...state.localTrackFavorites,
        [action.trackId]: action.uid
      }
    }
  },
  [REMOVE_LOCAL_TRACK_FAVORITE](state, action) {
    const newState = { ...state }
    delete newState.localTrackFavorites[action.trackId]
    newState.trackSaves = newState.trackSaves.filter(
      ({ save_item_id: id }) => id !== action.trackId
    )
    return newState
  },
  [ADD_LOCAL_TRACK_REPOST](state, action) {
    return {
      ...state,
      localTrackReposts: {
        ...state.localTrackReposts,
        [action.trackId]: action.uid
      }
    }
  },
  [REMOVE_LOCAL_TRACK_REPOST](state, action) {
    const newState = { ...state }
    delete newState.localTrackReposts[action.trackId]
    newState.trackSaves = newState.trackSaves.filter(
      ({ save_item_id: id }) => id !== action.trackId
    )
    return newState
  },
  [ADD_LOCAL_TRACK_PURCHASE](state, action) {
    return {
      ...state,
      localTrackPurchases: {
        ...state.localTrackPurchases,
        [action.trackId]: action.uid
      }
    }
  },
  [ADD_LOCAL_COLLECTION_FAVORITE](state, action) {
    return addCollectionLocally({ state, action, type: 'favorite' })
  },
  [REMOVE_LOCAL_COLLECTION_FAVORITE](state, action) {
    return removeCollectionLocally({ state, action, type: 'favorite' })
  },
  [ADD_LOCAL_COLLECTION_REPOST](state, action) {
    return addCollectionLocally({ state, action, type: 'repost' })
  },
  [REMOVE_LOCAL_COLLECTION_REPOST](state, action) {
    return removeCollectionLocally({ state, action, type: 'repost' })
  },
  [SET_SELECTED_CATEGORY](state, action) {
    return {
      ...state,
      selectedCategory: action.category
    }
  },
  [signOut.type]() {
    return initialState
  }
}

const tracksLineupReducer = asLineup(tracksPrefix, tracksReducer)

const reducer = (state = initialState, action) => {
  const tracks = tracksLineupReducer(state.tracks, action)
  if (tracks !== state.tracks) return { ...state, tracks }

  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default reducer
