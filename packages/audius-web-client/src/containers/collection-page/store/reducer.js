import { asLineup } from 'store/lineup/reducer'
import tracksReducer from 'containers/collection-page/store/lineups/tracks/reducer'
import { PREFIX as tracksPrefix } from './lineups/tracks/actions'
import { Status } from 'store/types'

import {
  FETCH_COLLECTION,
  FETCH_COLLECTION_SUCCEEDED,
  FETCH_COLLECTION_FAILED,
  RESET_COLLECTION,
  SET_SMART_COLLECTION
} from './actions'

const initialState = {
  collectionId: null,
  collectionUid: null,
  userUid: null,
  status: null,
  smartCollectionVariant: null
}

const actionsMap = {
  [FETCH_COLLECTION](state, action) {
    return {
      ...state,
      status: Status.LOADING,
      smartCollectionVariant: null
    }
  },
  [FETCH_COLLECTION_SUCCEEDED](state, action) {
    return {
      ...state,
      collectionId: action.collectionId,
      collectionUid: action.collectionUid,
      userUid: action.userUid,
      status: Status.SUCCESS
    }
  },
  [FETCH_COLLECTION_FAILED](state, action) {
    return {
      ...state,
      userUid: action.userUid,
      status: Status.ERROR
    }
  },
  [RESET_COLLECTION](state, action) {
    return {
      ...state,
      ...initialState
    }
  },
  [SET_SMART_COLLECTION](state, action) {
    return {
      ...state,
      smartCollectionVariant: action.smartCollectionVariant
    }
  }
}

const tracksLineupReducer = asLineup(tracksPrefix, tracksReducer)

const reducer = (state = initialState, action) => {
  const updatedTracks = tracksLineupReducer(state.tracks, action)
  if (updatedTracks !== state.tracks) return { ...state, tracks: updatedTracks }
  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  return matchingReduceFunction(state, action)
}

export default reducer
