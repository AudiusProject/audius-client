import {
  UserCollectionMetadata,
  accountSelectors,
  getContext,
  reformatUser,
  usersActions
} from '@audius/common'
import { uniqBy } from 'lodash'
import { put, select } from 'typed-redux-saga'

import { waitForRead } from 'utils/sagaHelpers'

const getAccountUser = accountSelectors.getAccountUser

/**
 * Adds users from collection metadata to cache.
 * Dedupes users and removes self.
 * @param metadataArray
 */
export function* addUsersFromCollections(
  metadataArray: Array<UserCollectionMetadata>
) {
  yield* waitForRead()
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const accountUser = yield* select(getAccountUser)
  const currentUserId = accountUser?.user_id
  let users = metadataArray.map((m) =>
    reformatUser(m.user, audiusBackendInstance)
  )

  // Removes duplicates and self
  users = uniqBy(users, 'user_id')
  users = users.filter(
    (user) => !(currentUserId && user.user_id === currentUserId)
  )

  yield put(usersActions.addUsers({ users }))
}
