import { combineReducers } from 'redux'
import { createReducer, ActionType } from 'typesafe-actions'

import { UserListReducerFactory } from 'store/user-list/reducer'

import * as actions from './actions'
import {
  SUGGESTED_FOLLOWS_USER_LIST_TAG,
  SuggestedFollowsOwnState
} from './types'

type MutualsActions = ActionType<typeof actions>

const userListReducer = UserListReducerFactory.createReducer({
  tag: SUGGESTED_FOLLOWS_USER_LIST_TAG,
  pageSize: 15
})

const initialState = {
  id: null
}

const suggestedFollowsReducer = createReducer<
  SuggestedFollowsOwnState,
  MutualsActions
>(initialState, {
  [actions.SET_SUGGESTEDFOLLOWS](state, action) {
    return {
      ...state,
      id: action.id
    }
  }
})

export default combineReducers({
  suggestedFollowsPage: suggestedFollowsReducer,
  userList: userListReducer
})
