import { createReducer, ActionType } from 'typesafe-actions'

import { ID } from 'models/common/Identifiers'

import * as actions from './actions'

type ShareSoundToTikTokModalActions = ActionType<typeof actions>

export enum Status {
  SHARE_STARTED,
  SHARE_SUCCESS,
  SHARE_ERROR
}

export type Track = {
  cid: string
  id: ID
  title: string
  duration: number
}

export type ShareSoundToTikTokModalState = {
  isAuthenticated: boolean
  isOpen: boolean
  track?: Track
  status: Status | null
}

const initialState = {
  isAuthenticated: false,
  isOpen: false,
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
      track: action.track,
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
