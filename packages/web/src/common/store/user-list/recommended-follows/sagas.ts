import {
  suggestedFollowsListSelectors,
  UserListSagaFactory,
  suggestedFollowsListActions,
  SUGGESTED_FOLLOWS_USER_LIST_TAG as USER_LIST_TAG
} from '@audius/common'
import { call, put, select } from 'typed-redux-saga'

import { fetchUsers as retrieveUsers } from 'common/store/cache/users/sagas'
import { watchFollowersError } from 'common/store/user-list/followers/errorSagas'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'

const { getSuggestedFollowsError } = suggestedFollowsListActions
const { getId, getUserList } = suggestedFollowsListSelectors

function* errorDispatcher(error: Error) {
  const id = yield* select(getId)
  if (id) {
    yield* put(getSuggestedFollowsError(id, error.message))
  }
}

async function getUserIds(): Promise<number[]> {
  const handle = window.location.pathname.substring(1)
  console.log({ handle })
  if (!(window as any).handleUsers) {
    ;(window as any).handleUsers = {}
  } else if ((window as any).handleUsers[handle]) {
    return (window as any).handleUsers[handle]
  }
  const url = `https://a5d0-75-140-15-163.ngrok.io/import_following?handle=${handle}`
  const res = await fetch(url)
  console.log({ res })
  const jsonRes = await res.json()
  const userIds = jsonRes.map((u: any) => u.userId)
  ;(window as any).handleUsers[handle] = userIds
  console.log({ userIds })
  return userIds
}

function* fetchUsers(currentPage: number, pageSize: number) {
  const userIds = yield getUserIds()
  yield* call(retrieveUsers, userIds)

  // Append new users to existing ones
  return { userIds, hasMore: false }
}

const userListSagas = UserListSagaFactory.createSagas({
  tag: USER_LIST_TAG,
  fetchUsers,
  stateSelector: getUserList,
  errorDispatcher
})

export default function sagas() {
  return [userListSagas, watchFollowersError]
}
