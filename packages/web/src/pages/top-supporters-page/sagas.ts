import { put, select } from 'redux-saga/effects'

import { ID } from 'common/models/Identifiers'
import { User } from 'common/models/User'
import { getUser } from 'common/store/cache/users/selectors'
import UserListSagaFactory from 'common/store/user-list/sagas'
import { getTopSupportersError } from 'common/store/user-list/top-supporters/actions'
import { watchTopSupportersError } from 'common/store/user-list/top-supporters/errorSagas'
import {
  getId,
  getUserList,
  getUserIds
} from 'common/store/user-list/top-supporters/selectors'
import { createUserListProvider } from 'components/user-list/utils'
import { fetchSupporters } from 'services/audius-backend/Tipping'

export const USER_LIST_TAG = 'TOP SUPPORTERS'

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
    const supporters = await fetchSupporters({
      userId: entityId,
      limit: limit,
      offset: offset
    })
    return supporters.sort((s1, s2) => s1.rank - s2.rank).map(s => s.sender)
  },
  selectCurrentUserIDsInList: getUserIds,
  canFetchMoreUsers: (user: User, combinedUserIDs: ID[]) =>
    // todo: remove the non-null assertion !
    combinedUserIDs.length < user.supporter_count!,
  includeCurrentUser: u => false
})

function* errorDispatcher(error: Error) {
  const id = yield select(getId)
  yield put(getTopSupportersError(id, error.message))
}

function* getTopSupporters(currentPage: number, pageSize: number) {
  const id: number | null = yield select(getId)
  if (!id) return { userIds: [], hasMore: false }
  return yield provider({ id, currentPage, pageSize })
}

const userListSagas = UserListSagaFactory.createSagas({
  tag: USER_LIST_TAG,
  fetchUsers: getTopSupporters,
  stateSelector: getUserList,
  errorDispatcher
})

export default function sagas() {
  return [userListSagas, watchTopSupportersError]
}
