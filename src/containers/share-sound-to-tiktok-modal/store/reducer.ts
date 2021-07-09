import { createReducer, ActionType } from 'typesafe-actions'

import { ID } from 'models/common/Identifiers'

import * as actions from './actions'

type ShareSoundToTikTokModalActions = ActionType<typeof actions>

export enum Status {
  SHARE_STARTED,
  SHARE_SUCCESS,
  SHARE_ERROR
}

export type ShareSoundToTikTokModalState = {
  isAuthenticated: boolean
  isOpen: boolean
  trackCid: string | null
  trackId: ID | null
  trackTitle: string | null
  status: Status | null
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
      isAuthenticated: false,
      isOpen: true,
      trackCid: action.trackCid,
      trackId: action.trackId,
      trackTitle: action.trackTitle,
      status: null
    }
  },
  [actions.CLOSE](state, _) {
    return {
      ...state,
      isOpen: false
    }
  },
  [actions.SET_STATUS](state, action) {
    return {
      ...state,
      status: action.status
    }
  },
  [actions.SET_IS_AUTHENTICATED](state, _) {
    return {
      ...state,
      isAuthenticated: true
    }
  }
})

export default reducer
