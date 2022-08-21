import { UserCollectionMetadata, Kind, makeUid } from '@audius/common'
import { uniqBy } from 'lodash'
import { put, select } from 'typed-redux-saga'

import { getAccountUser } from 'common/store/account/selectors'
import * as cacheActions from 'common/store/cache/actions'
import { reformat as reformatUser } from 'common/store/cache/users/utils'
import { getContext } from 'common/store/effects'
import { waitForAccount } from 'common/utils/sagaHelpers'

/**
 * Adds users from collection metadata to cache.
 * Dedupes users and removes self.
 * @param metadataArray
 */
export function* addUsersFromCollections(
  metadataArray: Array<UserCollectionMetadata>
) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* waitForAccount()
  const accountUser = yield* select(getAccountUser)
  const currentUserId = accountUser?.user_id
  let users = metadataArray.map((m) => ({
    id: m.user.user_id,
    uid: makeUid(Kind.USERS, m.user.user_id),
    metadata: reformatUser(m.user, audiusBackendInstance)
  }))

  // Removes duplicates and self
  users = uniqBy(users, 'id')
  users = users.filter((user) => !(currentUserId && user.id === currentUserId))

  yield put(
    cacheActions.add(Kind.USERS, users, /* replace */ false, /* persist */ true)
  )
}
