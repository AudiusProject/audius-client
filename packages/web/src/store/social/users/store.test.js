import { Kind } from '@audius/common'
import { combineReducers } from 'redux'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'

import * as cacheActions from 'common/store/cache/actions'
import { adjustUserField } from 'common/store/cache/users/sagas'
import * as actions from 'common/store/social/users/actions'
import { waitForBackendSetup } from 'store/backend/sagas'
import * as sagas from 'store/social/users/sagas'
import { noopReducer } from 'store/testHelper'

const followedUser = { follower_count: 5 }
const accountUser = { followee_count: 1 }

describe('follow', () => {
  it('follows', async () => {
    await expectSaga(sagas.watchFollowUser, actions)
      .withReducer(
        combineReducers({
          account: noopReducer(),
          users: noopReducer()
        }),
        {
          account: {
            userId: 1
          },
          users: {
            entries: {
              2: { metadata: followedUser },
              1: { metadata: accountUser }
            }
          }
        }
      )
      .provide([[matchers.call.fn(waitForBackendSetup), true]])
      .dispatch(actions.followUser(2))
      .call(adjustUserField, {
        user: accountUser,
        fieldName: 'followee_count',
        delta: 1
      })
      .call(sagas.confirmFollowUser, 2, 1)
      .put(
        cacheActions.update(Kind.USERS, [
          {
            id: 2,
            metadata: {
              does_current_user_follow: true,
              follower_count: 6
            }
          }
        ])
      )
      .silentRun()
  })

  it('unfollows', async () => {
    await expectSaga(sagas.watchUnfollowUser, actions)
      .withReducer(
        combineReducers({
          account: noopReducer(),
          users: noopReducer()
        }),
        {
          account: {
            userId: 1
          },
          users: {
            entries: {
              2: { metadata: followedUser },
              1: { metadata: accountUser }
            }
          }
        }
      )
      .provide([[matchers.call.fn(waitForBackendSetup), true]])
      .dispatch(actions.unfollowUser(2))
      .call(sagas.confirmUnfollowUser, 2, 1)
      .put(
        cacheActions.update(Kind.USERS, [
          {
            id: 2,
            metadata: {
              does_current_user_follow: false,
              follower_count: 4
            }
          }
        ])
      )
      .silentRun()
  })
})
