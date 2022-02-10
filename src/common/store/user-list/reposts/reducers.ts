import { combineReducers } from 'redux'
import { createReducer, ActionType } from 'typesafe-actions'

import { UserListReducerFactory } from 'common/store/user-list/reducer'

import * as actions from './actions'
import { USER_LIST_TAG } from './sagas'
import { RepostsOwnState, RepostType } from './types'

type TrackRepostActions = ActionType<typeof actions>

const userListReducer = UserListReducerFactory.createReducer(USER_LIST_TAG)

const initialState = {
  id: null,
  repostType: RepostType.TRACK
}

const repostsPageReducer = createReducer<RepostsOwnState, TrackRepostActions>(
  initialState,
  {
    [actions.SET_REPOST](state, action) {
      return {
        ...state,
        id: action.id,
        repostType: action.repostType
      }
    }
  }
)

export default combineReducers({
  repostsPage: repostsPageReducer,
  userList: userListReducer
})
