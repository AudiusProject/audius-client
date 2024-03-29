import { combineReducers } from 'redux'
import { createReducer, ActionType } from 'typesafe-actions'

import { UserListReducerFactory } from '../reducer'

import * as actions from './actions'
import { RepostsOwnState, RepostType, REPOSTS_USER_LIST_TAG } from './types'

type TrackRepostActions = ActionType<typeof actions>

const userListReducer = UserListReducerFactory.createReducer({
  tag: REPOSTS_USER_LIST_TAG,
  pageSize: 15
})

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
