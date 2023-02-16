import {
  accountSelectors,
  SearchKind,
  searchUsersModalActions,
  searchUsersModalSelectors,
  User
} from '@audius/common'
import { call, put, select, takeLatest } from 'typed-redux-saga'

import { processAndCacheUsers } from 'common/store/cache/users/utils'
import { apiClient } from 'services/audius-api-client'
const { getUserId } = accountSelectors
const { searchUsers, searchUsersSucceeded } = searchUsersModalActions
const { getUserList } = searchUsersModalSelectors

function* doSearchUsers(action: ReturnType<typeof searchUsers>) {
  const { query, limit = 15 } = action.payload
  const userList = yield* select(getUserList)
  try {
    const currentUserId = yield* select(getUserId)
    const res = yield* call([apiClient, apiClient.getSearchFull], {
      currentUserId,
      query,
      kind: SearchKind.USERS,
      offset: userList.userIds.length,
      limit
    })
    const users = Object.values(res.users) as User[]
    yield* call(processAndCacheUsers, users)
    yield* put(searchUsersSucceeded({ userIds: users.map((u) => u.user_id) }))
  } catch (e) {
    console.error(e)
  }
}

function* watchSearchUsers() {
  yield* takeLatest(searchUsers, doSearchUsers)
}

export default function sagas() {
  return [watchSearchUsers]
}
