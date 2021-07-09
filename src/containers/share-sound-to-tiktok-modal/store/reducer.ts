import { createReducer, ActionType } from 'typesafe-actions'

import { ID } from 'models/common/Identifiers'

import * as actions from './actions'

type ShareSoundToTikTokModalActions = ActionType<typeof actions>

export type ShareSoundToTikTokModalState = {
  isAuthenticated: boolean
  isOpen: boolean
  trackCid: string | null
  trackId: ID | null
  trackTitle: string | null
  status: string | null
}

const initialState = {
  isAuthenticated: false,
  isOpen: false,
  trackCid: null,
  trackId: null,
  trackTitle: null,
  status: null
}

const reducer = createReducer<
  ShareSoundToTikTokModalState,
  ShareSoundToTikTokModalActions
>(initialState, {
  [actions.OPEN](state, action) {
    return {
      ...state,
      isOpen: true,
      trackCid: action.trackCid,
      trackId: action.trackId,
      trackTitle: action.trackTitle
    }
  },
  [actions.CLOSE](state, _) {
    return {
      ...state,
      isAuthenticated: false,
      isOpen: false,
      trackCid: null,
      trackId: null,
      trackTitle: null,
      status: null
    }
  },
  [actions.DOWNLOAD_STARTED](state, _) {
    return {
      ...state,
      // TODO: make enum
      status: 'DOWNLOAD_STARTED'
    }
  },
  [actions.SET_IS_AUTHENTICATED](state, _) {
    return {
      ...state,
      isAuthenticated: true
    }
  },
  [actions.UPLOAD_SUCCESS](state, _) {
    return {
      ...state,
      status: 'UPLOAD_SUCCESS'
    }
  }
})

export default reducer
