import { ID } from 'models/common/Identifiers'
import { UserListStoreState } from 'containers/user-list/store/types'

export type FollowingOwnState = {
  id: ID | null
}

export type FollowingPageState = {
  followingPage: FollowingOwnState
  userList: UserListStoreState
}
