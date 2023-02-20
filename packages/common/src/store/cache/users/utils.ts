import { put } from 'typed-redux-saga'

import { UserMetadata } from 'models/User'
import { AudiusBackend } from 'services/audius-backend'
import { getContext } from 'store/effects'
import { cacheUsersActions } from 'store/users'
import { waitForRead } from 'utils/sagaHelpers'

export function* processAndCacheUsers(users: UserMetadata[]) {
  yield* waitForRead()
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const reformattedUsers = users.map((user) => {
    return reformatUser(user, audiusBackendInstance)
  })

  // insert users into cache
  yield* put(cacheUsersActions.addUsers({ users: reformattedUsers }))

  return reformattedUsers
}

/**
 * Sets a user's display name to their handle if it is falsey.
 * During sign-up, it's possible for an account to be created but the set display
 * name transaction to fail, which would leave us in a bad UI state.
 */
const setDisplayNameToHandleIfUnset = <T extends UserMetadata>(user: T) => {
  if (user.name) return user
  return {
    ...user,
    name: user.handle
  }
}

/**
 * Reformats a user to be used internally within the client.
 * This method should *always* be called before a user is cached.
 */
export const reformatUser = (
  user: UserMetadata,
  audiusBackendInstance: AudiusBackend
) => {
  const withImages = audiusBackendInstance.getUserImages(user)

  const withNames = setDisplayNameToHandleIfUnset(withImages)
  return withNames
}
