import { put, select } from 'redux-saga/effects'

import { ID } from 'common/models/Identifiers'
import { User } from 'common/models/User'
import { getUser } from 'common/store/cache/users/selectors'
import { getFollowersError } from 'common/store/user-list/followers/actions'
import { watchFollowersError } from 'common/store/user-list/followers/errorSagas'
import {
  getId,
  getUserList,
  getUserIds
} from 'common/store/user-list/followers/selectors'
import UserListSagaFactory from 'common/store/user-list/sagas'
import { createUserListProvider } from 'components/user-list/utils'
import apiClient from 'services/audius-api-client/AudiusAPIClient'

export const USER_LIST_TAG = 'FOLLOWERS'

const provider = createUserListProvider<User>({
  getExistingEntity: getUser,
  extractUserIDSubsetFromEntity: () => [],
  fetchAllUsersForEntity: ({
    limit,
    offset,
    entityId,
    currentUserId
  }: {
    limit: number
    offset: number
    entityId: ID
    currentUserId: ID | null
  }) => {
    return apiClient.getFollowers({
      currentUserId,
      profileUserId: entityId,
      limit: limit,
      offset: offset
    })
  },
  selectCurrentUserIDsInList: getUserIds,
  canFetchMoreUsers: (user: User, combinedUserIDs: ID[]) =>
    combinedUserIDs.length < user.follower_count,
  includeCurrentUser: u => u.does_current_user_follow
})

function* errorDispatcher(error: Error) {
  const id = yield select(getId)
  yield put(getFollowersError(id, error.message))
}

function* getFollowers(currentPage: number, pageSize: number) {
  const id: number | null = yield select(getId)
  if (!id) return { userIds: [], hasMore: false }
  return yield provider({ id, currentPage, pageSize })
}

const userListSagas = UserListSagaFactory.createSagas({
  tag: USER_LIST_TAG,
  fetchUsers: getFollowers,
  stateSelector: getUserList,
  errorDispatcher
})

export default function sagas() {
  return [userListSagas, watchFollowersError]
}
