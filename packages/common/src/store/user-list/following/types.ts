import { ID } from 'models/index'
import { UserListStoreState } from 'store/user-list/types'

export type FollowingOwnState = {
  id: ID | null
}

export type FollowingPageState = {
  followingPage: FollowingOwnState
  userList: UserListStoreState
}

export const FOLLOWING_USER_LIST_TAG = 'FOLLOWING'
