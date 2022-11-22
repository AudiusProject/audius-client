import { UserListStoreState } from 'store/user-list/types'

import { ID } from '../../../models'

export type SuggestedFollowsOwnState = {
  id: ID | null
}

export type SuggestedFollowsPageState = {
  suggestedFollowsPage: SuggestedFollowsOwnState
  userList: UserListStoreState
}

export const SUGGESTED_FOLLOWS_USER_LIST_TAG = 'SUGGESTED_FOLLOWS'
