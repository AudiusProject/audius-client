import { createReducer, ActionType } from 'typesafe-actions'

import { ID } from 'models/common/Identifiers'

import * as actions from './actions'

type ShareSoundToTikTokModalActions = ActionType<typeof actions>

export type ShareSoundToTikTokModalState = {
  isOpen: boolean
  trackCid: string | null
  trackId: ID | null
  trackTitle: string | null
}

const initialState = {
  isOpen: false,
  trackCid: null,
  trackId: null,
  trackTitle: null
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
  [actions.CLOSE](state, action) {
    return {
      ...state,
      isOpen: false,
      trackCid: null,
      trackId: null,
      trackTitle: null
    }
  }
})

export default reducer
