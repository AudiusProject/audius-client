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
  const domain = ''
  //   yield fetch(`${domain}/import_following`)
  //     .then((resp) => resp.json())
  //     .then((users) => users.map((u: any) => u.user_id))
  const userIds = [12, 3, 5, 12, 1241]
  const users = await audiusBackendInstance.getCreators(userIds)
  const usersNotFollowed = users.filter(
    (user) => !user.does_current_user_follow
  )
  const recommendedUserIds = usersNotFollowed.map((u) => u.user_id)

  return recommendedUserIds
}

function* fetchUsers(currentPage: number, pageSize: number) {
  console.log('in fetch users saga')
  const userIds = yield getUserIds()
  console.log('got user ids in fetch users')
  console.log({ userIds })
  yield* call(retrieveUsers, userIds)
  console.log('got the users')

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
