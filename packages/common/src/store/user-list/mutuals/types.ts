import { ID } from 'models/index'
import { UserListStoreState } from 'store/user-list/types'

export type MutualsOwnState = {
  id: ID | null
}

export type MutualsPageState = {
  followingPage: MutualsOwnState
  userList: UserListStoreState
}

export const MUTUALS_USER_LIST_TAG = 'MUTUALS'
