import UserListSagaFactory from 'containers/user-list/store/sagas'
import { USER_LIST_TAG } from '../FollowingPage'
import { put, select } from 'redux-saga/effects'
import { getId, getUserList, getUserIds } from './selectors'
import { ID } from 'models/common/Identifiers'
import AudiusBackend from 'services/AudiusBackend'
import { createUserListProvider } from 'containers/user-list/utils'
import { getFollowingError } from './actions'
import { watchFollowingError } from './errorSagas'
import User from 'models/User'
import { getUser } from 'store/cache/users/selectors'

const provider = createUserListProvider<User>({
  getExistingEntity: getUser,
  extractUserIDSubsetFromEntity: () => [],
  fetchAllUsersForEntity: ({
    limit,
    offset,
    entityId
  }: {
    limit: number
    offset: number
    entityId: ID
  }) => AudiusBackend.getFollowees(entityId, limit, offset),
  selectCurrentUserIDsInList: getUserIds,
  canFetchMoreUsers: (user: User, combinedUserIDs: ID[]) =>
    combinedUserIDs.length < user.followee_count,

  includeCurrentUser: _ => false
})

function* errorDispatcher(error: Error) {
  const id = yield select(getId)
  yield put(getFollowingError(id, error.message))
}

function* getFollowing(currentPage: number, pageSize: number) {
  const id: number | null = yield select(getId)
  if (!id) return { userIds: [], hasMore: false }
  return yield provider({ id, currentPage, pageSize })
}

const userListSagas = UserListSagaFactory.createSagas({
  tag: USER_LIST_TAG,
  fetchUsers: getFollowing,
  stateSelector: getUserList,
  errorDispatcher
})

export default function sagas() {
  return [userListSagas, watchFollowingError]
}
