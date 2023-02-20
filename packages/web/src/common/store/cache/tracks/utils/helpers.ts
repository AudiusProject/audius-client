import {
  TrackMetadata,
  User,
  accountSelectors,
  getContext,
  reformatUser,
  UserTrack,
  cacheUsersActions
} from '@audius/common'
import { uniqBy } from 'lodash'
import { put, select } from 'typed-redux-saga'

import { waitForRead } from 'utils/sagaHelpers'
const getAccountUser = accountSelectors.getAccountUser

/**
 * Adds users from track metadata to cache.
 * Dedupes and removes self.
 * @param metadataArray
 */
export function* addUsersFromTracks<T extends TrackMetadata & { user?: User }>(
  metadataArray: T[]
) {
  yield* waitForRead()
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const accountUser = yield* select(getAccountUser)
  const currentUserId = accountUser?.user_id
  let users = metadataArray
    .filter((m) => m.user)
    .map((m) => {
      const track = m as unknown as UserTrack
      return reformatUser(track.user, audiusBackendInstance)
    })

  if (!users.length) return

  // Don't add duplicate users or self
  users = uniqBy(users, 'id')
  users = users.filter(
    (user) => !(currentUserId && user.user_id === currentUserId)
  )

  yield put(cacheUsersActions.addUsers({ users }))
}
