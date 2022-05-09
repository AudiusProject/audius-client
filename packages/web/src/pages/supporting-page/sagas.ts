import { put, select } from 'redux-saga/effects'

import { ID } from 'common/models/Identifiers'
import { User } from 'common/models/User'
import { getUser } from 'common/store/cache/users/selectors'
import UserListSagaFactory from 'common/store/user-list/sagas'
import { getSupportingError } from 'common/store/user-list/supporting/actions'
import { watchSupportingError } from 'common/store/user-list/supporting/errorSagas'
import {
  getId,
  getUserList,
  getUserIds
} from 'common/store/user-list/supporting/selectors'
import { createUserListProvider } from 'components/user-list/utils'
import { fetchSupporting } from 'services/audius-backend/Tipping'

export const USER_LIST_TAG = 'SUPPORTING'

const provider = createUserListProvider<User>({
  getExistingEntity: getUser,
  extractUserIDSubsetFromEntity: () => [],
  fetchAllUsersForEntity: async ({
    limit,
    offset,
    entityId
  }: {
    limit: number
    offset: number
    entityId: ID
    currentUserId: ID | null
  }) => {
    const supporting = await fetchSupporting({
      userId: entityId,
      limit: limit,
      offset: offset
    })
    return supporting
      .sort((s1, s2) => s2.amount - s1.amount)
      .map(s => s.receiver)
  },
  selectCurrentUserIDsInList: getUserIds,
  canFetchMoreUsers: (user: User, combinedUserIDs: ID[]) =>
    // todo: remove the non-null assertion !
    combinedUserIDs.length < user.supporting_count!,
  includeCurrentUser: u => false
})

function* errorDispatcher(error: Error) {
  const id = yield select(getId)
  yield put(getSupportingError(id, error.message))
}

function* getSupporting(currentPage: number, pageSize: number) {
  const id: number | null = yield select(getId)
  if (!id) return { userIds: [], hasMore: false }
  return yield provider({ id, currentPage, pageSize })
}

const userListSagas = UserListSagaFactory.createSagas({
  tag: USER_LIST_TAG,
  fetchUsers: getSupporting,
  stateSelector: getUserList,
  errorDispatcher
})

export default function sagas() {
  return [userListSagas, watchSupportingError]
}
