// @ts-nocheck
// TODO(nkang) - convert to TS
import { asLineup } from 'store/lineup/reducer'
import {
  FETCH_SAVES,
  FETCH_SAVES_REQUESTED,
  FETCH_SAVES_SUCCEEDED,
  FETCH_SAVES_FAILED,
  FETCH_MORE_SAVES,
  FETCH_MORE_SAVES_SUCCEEDED,
  FETCH_MORE_SAVES_FAILED,
  ADD_LOCAL_SAVE,
  REMOVE_LOCAL_SAVE,
  END_FETCHING,
  SET_SELECTED_CATEGORY
} from 'store/pages/saved-page/actions'
import tracksReducer, {
  initialState as initialLineupState
} from 'store/pages/saved-page/lineups/tracks/reducer'
import { signOut } from 'store/sign-out/slice'
import { ActionsMap } from 'utils/reducer'

import { PREFIX as tracksPrefix } from './lineups/tracks/actions'
import { LibraryCategory, SavedPageState } from './types'

const initialState = {
  // id => uid
  localSaves: {},
  saves: [],
  initialFetch: false,
  hasReachedEnd: false,
  fetchingMore: false,
  tracks: initialLineupState,
  selectedCategory: LibraryCategory.Favorite
} as SavedPageState

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
      saves: action.saves,
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
      saves: []
    }
  },
  [FETCH_MORE_SAVES_SUCCEEDED](state, action) {
    const savesCopy = state.saves.slice()
    savesCopy.splice(action.offset, action.saves.length, ...action.saves)

    return {
      ...state,
      fetchingMore: false,
      saves: savesCopy
    }
  },
  [FETCH_MORE_SAVES_FAILED](state) {
    return { ...state }
  },
  [END_FETCHING](state, action) {
    const savesCopy = state.saves.slice(0, action.endIndex)
    return {
      ...state,
      saves: savesCopy,
      hasReachedEnd: true
    }
  },
  [ADD_LOCAL_SAVE](state, action) {
    return {
      ...state,
      localSaves: {
        ...state.localSaves,
        [action.trackId]: action.uid
      }
    }
  },
  [REMOVE_LOCAL_SAVE](state, action) {
    const newState = { ...state }
    delete newState.localSaves[action.trackId]
    newState.saves = newState.saves.filter(
      ({ save_item_id: id }) => id !== action.trackId
    )
    return newState
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
