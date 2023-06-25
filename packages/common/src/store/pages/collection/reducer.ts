// @ts-nocheck
// TODO: KJ - Add types to this file
import { Status } from '../../../models/Status'
import { asLineup } from '../../../store/lineup/reducer'

import {
  FETCH_COLLECTION,
  FETCH_COLLECTION_SUCCEEDED,
  FETCH_COLLECTION_FAILED,
  RESET_COLLECTION,
  SET_SMART_COLLECTION,
  SET_COLLECTION_PERMALINK,
  SET_SAVED_TRACK_IDS,
  ADD_SUGGESTED_IDS
} from './actions'
import { PREFIX as tracksPrefix } from './lineup/actions'
import tracksReducer, {
  initialState as initialLineupState
} from './lineup/reducer'
import { PREFIX as suggestedTracksPrefix } from './suggestedLineup/actions'
import suggestedTracksReducer, {
  initialState as initialSuggestedLineupState
} from './suggestedLineup/reducer'

export const initialState = {
  collectionId: null,
  collectionUid: null,
  userUid: null,
  status: null,
  smartCollectionVariant: null,
  tracks: initialLineupState,
  suggestedTracks: initialSuggestedLineupState,
  savedTrackIds: null,
  prevSuggestedIds: []
}

const actionsMap = {
  [FETCH_COLLECTION](state, action) {
    return {
      ...state,
      status: Status.LOADING,
      smartCollectionVariant: null
    }
  },
  [SET_COLLECTION_PERMALINK](state, action) {
    return {
      ...state,
      permalink: action.permalink
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
  },
  [SET_SAVED_TRACK_IDS](state, action) {
    return {
      ...state,
      savedTrackIds: action.trackIds
    }
  },
  [ADD_SUGGESTED_IDS](state, action) {
    return {
      ...state,
      prevSuggestedIds: [...state.prevSuggestedIds, ...action.trackIds]
    }
  }
}

const tracksLineupReducer = asLineup(tracksPrefix, tracksReducer)
const suggestedTracksLineupReducer = asLineup(
  suggestedTracksPrefix,
  suggestedTracksReducer
)

const reducer = (state = initialState, action) => {
  const updatedTracks = tracksLineupReducer(state.tracks, action)
  if (updatedTracks !== state.tracks) {
    return { ...state, tracks: updatedTracks }
  }

  const updatedSuggestedTracks = suggestedTracksLineupReducer(
    state.suggestedTracks,
    action
  )
  if (updatedSuggestedTracks !== state.suggestedTracks) {
    return { ...state, suggestedTracks: updatedSuggestedTracks }
  }

  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state

  return matchingReduceFunction(state, action)
}

export default reducer
