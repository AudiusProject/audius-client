import { createReducer, ActionType } from 'typesafe-actions'
import * as actions from './actions'
import { FollowersOwnState } from './types'
import { UserListReducerFactory } from 'containers/user-list/store/reducer'
import { USER_LIST_TAG } from '../FollowersPage'
import { combineReducers } from 'redux'

type FollowersActions = ActionType<typeof actions>

const userListReducer = UserListReducerFactory.createReducer(USER_LIST_TAG)

const initialState = {
  id: null
}

const followersPageReducer = createReducer<FollowersOwnState, FollowersActions>(
  initialState,
  {
    [actions.SET_FOLOWING](state, action) {
      return {
        ...state,
        id: action.id
      }
    }
  }
)

export default combineReducers({
  followersPage: followersPageReducer,
  userList: userListReducer
})
