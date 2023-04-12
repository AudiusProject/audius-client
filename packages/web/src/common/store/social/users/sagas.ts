import {
  Kind,
  ID,
  Name,
  makeKindId,
  accountSelectors,
  cacheActions,
  cacheUsersSelectors,
  getContext,
  usersSocialActions as socialActions,
  FeatureFlags,
  profilePageActions
} from '@audius/common'
import { call, select, takeEvery, put } from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
import { adjustUserField } from 'common/store/cache/users/sagas'
import * as confirmerActions from 'common/store/confirmer/actions'
import { confirmTransaction } from 'common/store/confirmer/sagas'
import * as signOnActions from 'common/store/pages/signon/actions'
import { profilePage } from 'utils/route'
import { waitForWrite } from 'utils/sagaHelpers'

import errorSagas from './errorSagas'
const { getUsers, getUser } = cacheUsersSelectors
const { setNotificationSubscription } = profilePageActions
const { getUserId } = accountSelectors

/* FOLLOW */

export function* watchFollowUser() {
  yield* takeEvery(socialActions.FOLLOW_USER, followUser)
}

export function* followUser(
  action: ReturnType<typeof socialActions.followUser>
) {
  yield* waitForWrite()
  const getFeatureEnabled = yield* getContext('getFeatureEnabled')

  const accountId = yield* select(getUserId)
  if (!accountId) {
    yield* put(signOnActions.openSignOn(false))
    yield* put(signOnActions.showRequiresAccountModal())
    yield* put(make(Name.CREATE_ACCOUNT_OPEN, { source: 'social action' }))
    return
  }
  if (accountId === action.userId) {
    return
  }

  const users = yield* select(getUsers, { ids: [action.userId, accountId] })
  const followedUser = users[action.userId]
  const currentUser = users[accountId]

  if (followedUser) {
    // Increment the followed user's follower count
    yield* put(
      cacheActions.update(Kind.USERS, [
        {
          id: action.userId,
          metadata: {
            does_current_user_follow: true,
            follower_count: followedUser.follower_count + 1
          }
        }
      ])
    )
  }
  // Increment the signed in user's followee count
  yield* call(adjustUserField, {
    user: currentUser,
    fieldName: 'followee_count',
    delta: 1
  })

  const event = make(Name.FOLLOW, { id: action.userId, source: action.source })
  yield* put(event)

  yield* call(confirmFollowUser, action.userId, accountId)
  const shouldAutoSubscribe = yield* call(
    getFeatureEnabled,
    FeatureFlags.AUTO_SUBSCRIBE_ON_FOLLOW
  )
  if (shouldAutoSubscribe) {
    yield* put(
      setNotificationSubscription(
        action.userId,
        /* isSubscribed */ true,
        /* update */ true
      )
    )
  }
}

export function* confirmFollowUser(userId: ID, accountId: ID) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.USERS, userId),
      function* () {
        const { blockHash, blockNumber } = yield* call(
          audiusBackendInstance.followUser,
          userId
        )
        const confirmed = yield* call(
          confirmTransaction,
          blockHash,
          blockNumber
        )
        if (!confirmed) {
          throw new Error(
            `Could not confirm follow user for user id ${userId} and account id ${accountId}`
          )
        }
        return accountId
      },
      function* () {
        yield* put(socialActions.followUserSucceeded(userId))
      },
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        yield* put(
          socialActions.followUserFailed(userId, timeout ? 'Timeout' : message)
        )
        const users = yield* select(getUsers, { ids: [userId, accountId] })
        const followedUser = users[userId]
        const currentUser = users[accountId]
        if (followedUser) {
          // Revert the incremented follower count on the followed user
          yield* put(
            cacheActions.update(Kind.USERS, [
              {
                id: userId,
                metadata: {
                  does_current_user_follow: false,
                  follower_count: followedUser.follower_count - 1
                }
              }
            ])
          )
        }

        // Revert the incremented followee count on the current user
        yield* call(adjustUserField, {
          user: currentUser,
          fieldName: 'followee_count',
          delta: -1
        })
      }
    )
  )
}

export function* watchUnfollowUser() {
  yield* takeEvery(socialActions.UNFOLLOW_USER, unfollowUser)
}

export function* unfollowUser(
  action: ReturnType<typeof socialActions.unfollowUser>
) {
  /* Make Async Backend Call */
  yield* waitForWrite()
  const accountId = yield* select(getUserId)
  if (!accountId) {
    yield* put(signOnActions.openSignOn(false))
    yield* put(signOnActions.showRequiresAccountModal())
    yield* put(make(Name.CREATE_ACCOUNT_OPEN, { source: 'social action' }))
    return
  }
  if (accountId === action.userId) {
    return
  }

  const users = yield* select(getUsers, { ids: [action.userId, accountId] })
  const unfollowedUser = users[action.userId]
  const currentUser = users[accountId]

  // Decrement the follower count on the unfollowed user
  yield* put(
    cacheActions.update(Kind.USERS, [
      {
        id: action.userId,
        metadata: {
          does_current_user_follow: false,
          follower_count: unfollowedUser.follower_count - 1
        }
      }
    ])
  )

  // Decrement the followee count on the current user
  yield* call(adjustUserField, {
    user: currentUser,
    fieldName: 'followee_count',
    delta: -1
  })

  const event = make(Name.UNFOLLOW, {
    id: action.userId,
    source: action.source
  })
  yield* put(event)

  yield* call(confirmUnfollowUser, action.userId, accountId)
  yield* put(
    setNotificationSubscription(
      action.userId,
      /* isSubscribed */ false,
      /* update */ true
    )
  )
}

export function* confirmUnfollowUser(userId: ID, accountId: ID) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.USERS, userId),
      function* () {
        const { blockHash, blockNumber } = yield* call(
          audiusBackendInstance.unfollowUser,
          userId
        )
        const confirmed = yield* call(
          confirmTransaction,
          blockHash,
          blockNumber
        )
        if (!confirmed) {
          throw new Error(
            `Could not confirm unfollow user for user id ${userId} and account id ${accountId}`
          )
        }
        return accountId
      },
      function* () {
        yield* put(socialActions.unfollowUserSucceeded(userId))
      },
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        yield* put(
          socialActions.unfollowUserFailed(
            userId,
            timeout ? 'Timeout' : message
          )
        )
        const users = yield* select(getUsers, { ids: [userId, accountId] })
        const unfollowedUser = users[userId]
        const currentUser = users[accountId]

        // Revert decremented follower count on unfollowed user
        yield* put(
          cacheActions.update(Kind.USERS, [
            {
              id: userId,
              metadata: {
                does_current_user_follow: true,
                follower_count: unfollowedUser.follower_count + 1
              }
            }
          ])
        )

        // Revert decremented followee count on current user
        yield* call(adjustUserField, {
          user: currentUser,
          fieldName: 'followee_count',
          delta: 1
        })
      }
    )
  )
}

/* SUBSCRIBE */

export function* subscribeToUserAsync(userId: ID) {
  yield* waitForWrite()

  const accountId = yield* select(getUserId)
  if (!accountId) {
    return
  }

  yield* call(confirmSubscribeToUser, userId, accountId)
}

export function* confirmSubscribeToUser(userId: ID, accountId: ID) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.USERS, userId),
      function* () {
        const { blockHash, blockNumber } = yield* call(
          audiusBackendInstance.subscribeToUser,
          userId
        )
        const confirmed = yield* call(
          confirmTransaction,
          blockHash,
          blockNumber
        )
        if (!confirmed) {
          throw new Error(
            `Could not confirm subscribe to user for user id ${userId} and account id ${accountId}`
          )
        }
        return accountId
      },
      function* () {},
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        yield* put(
          socialActions.subscribeUserFailed(
            userId,
            timeout ? 'Timeout' : message
          )
        )
      }
    )
  )
}

export function* unsubscribeFromUserAsync(userId: ID) {
  yield* waitForWrite()

  const accountId = yield* select(getUserId)
  if (!accountId) {
    return
  }

  yield* call(confirmUnsubscribeFromUser, userId, accountId)
}

export function* confirmUnsubscribeFromUser(userId: ID, accountId: ID) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.USERS, userId),
      function* () {
        const { blockHash, blockNumber } = yield* call(
          audiusBackendInstance.unsubscribeFromUser,
          userId
        )
        const confirmed = yield* call(
          confirmTransaction,
          blockHash,
          blockNumber
        )
        if (!confirmed) {
          throw new Error(
            `Could not confirm unsubscribe from user for user id ${userId} and account id ${accountId}`
          )
        }
        return accountId
      },
      function* () {},
      function* ({ timeout, message }: { timeout: boolean; message: string }) {
        yield* put(
          socialActions.unsubscribeUserFailed(
            userId,
            timeout ? 'Timeout' : message
          )
        )
      }
    )
  )
}

/* SHARE */

export function* watchShareUser() {
  yield* takeEvery(
    socialActions.SHARE_USER,
    function* (action: ReturnType<typeof socialActions.shareUser>) {
      const { userId, source } = action

      const user = yield* select(getUser, { id: userId })
      if (!user) return

      const link = profilePage(user.handle)
      const share = yield* getContext('share')
      share(link, user.name)

      const event = make(Name.SHARE, {
        kind: 'profile',
        id: userId,
        url: link,
        source
      })
      yield* put(event)
    }
  )
}

const sagas = () => {
  return [watchFollowUser, watchUnfollowUser, watchShareUser, errorSagas]
}

export default sagas
