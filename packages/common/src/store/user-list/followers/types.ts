import { ID } from 'models/index'
import { UserListStoreState } from 'store/user-list/types'

export type FollowersOwnState = {
  id: ID | null
}

export type FollowersPageState = {
  followersPage: FollowersOwnState
  userList: UserListStoreState
}

export const FOLLOWERS_USER_LIST_TAG = 'FOLLOWERS'
