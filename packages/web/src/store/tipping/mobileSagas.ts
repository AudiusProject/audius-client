import { put, takeEvery } from 'redux-saga/effects'
import { select, call } from 'typed-redux-saga'

import { ID } from 'common/models/Identifiers'
import { RecentTipsStorage } from 'common/models/Tipping'
import { getSupporters, getSupporting } from 'common/store/tipping/selectors'
import {
  fetchRecentTips,
  setSupportersForUser,
  setSupportingForUser
} from 'common/store/tipping/slice'
import { Nullable } from 'common/utils/typeUtils'
import AudiusAPIClient from 'services/audius-api-client/AudiusAPIClient'
import { MessageType } from 'services/native-mobile-interface/types'

function* watchFetchRecentTips() {
  yield takeEvery(MessageType.FETCH_RECENT_TIPS, function* (action: {
    type: string
    storage: Nullable<RecentTipsStorage>
  }) {
    yield put(fetchRecentTips({ storage: action.storage }))
  })
}

function* watchFetchUserSupporter() {
  yield takeEvery(MessageType.FETCH_USER_SUPPORTER, function* (action: {
    type: string
    currentUserId: ID
    userId: ID
    supporterUserId: ID
  }) {
    const { currentUserId, userId, supporterUserId } = action
    try {
      const response = yield* call(
        [AudiusAPIClient, AudiusAPIClient.getUserSupporter],
        {
          currentUserId,
          userId,
          supporterUserId
        }
      )
      if (response) {
        const supportingMap = yield* select(getSupporting)
        yield put(
          setSupportingForUser({
            id: supporterUserId,
            supportingForUser: {
              ...supportingMap[supporterUserId],
              [userId]: {
                receiver_id: userId,
                amount: response.amount,
                rank: response.rank
              }
            }
          })
        )

        const supportersMap = yield* select(getSupporters)
        yield put(
          setSupportersForUser({
            id: userId,
            supportersForUser: {
              ...supportersMap[userId],
              [supporterUserId]: {
                sender_id: supporterUserId,
                amount: response.amount,
                rank: response.rank
              }
            }
          })
        )
      }
    } catch (e) {
      console.error(
        `Could not fetch user supporter for user id ${userId}, supporter user id ${supporterUserId}, and current user id ${currentUserId}: ${
          (e as Error).message
        }`
      )
    }
  })
}

const sagas = () => {
  return [watchFetchRecentTips, watchFetchUserSupporter]
}

export default sagas
