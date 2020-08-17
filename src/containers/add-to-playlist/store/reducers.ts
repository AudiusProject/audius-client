import { createReducer, ActionType } from 'typesafe-actions'
import * as actions from './actions'
import { ID } from 'models/common/Identifiers'

type AddToPlaylistActions = ActionType<typeof actions>

export type AddToPlaylistState = {
  isOpen: boolean
  trackId: ID | null
  trackTitle: string | null
}

const initialState = {
  isOpen: false,
  trackId: null,
  trackTitle: null
}

const reducer = createReducer<AddToPlaylistState, AddToPlaylistActions>(
  initialState,
  {
    [actions.OPEN](state, action) {
      return {
        ...state,
        isOpen: true,
        trackId: action.trackId,
        trackTitle: action.trackTitle
      }
    },
    [actions.CLOSE](state, action) {
      return {
        ...state,
        isOpen: false,
        trackId: null,
        trackTitle: null
      }
    }
  }
)

export default reducer
