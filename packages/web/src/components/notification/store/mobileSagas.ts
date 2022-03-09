import { all, call, put, select, takeEvery } from 'redux-saga/effects'

import { getHasAccount } from 'common/store/account/selectors'
import * as notificationActions from 'common/store/notifications/actions'
import {
  getNotificationEntities,
  getNotificationEntity,
  getNotificationUser,
  getNotificationUsers
} from 'common/store/notifications/selectors'
import {
  ConnectedNotification,
  Notification,
  NotificationType
} from 'common/store/notifications/types'
import AudiusBackend from 'services/AudiusBackend'
import {
  FetchNotificationsSuccessMessage,
  FetchNotificationsReplaceMessage,
  FetchNotificationsFailureMessage,
  ResetNotificationsBadgeCount
} from 'services/native-mobile-interface/notifications'
import { MessageType } from 'services/native-mobile-interface/types'
import { waitForBackendSetup } from 'store/backend/sagas'

import { getNotifications } from './sagas'

// Clear the notification badges if the user is signed in
function* resetNotificationBadgeCount() {
  try {
    const hasAccount = yield select(getHasAccount)
    if (hasAccount) {
      const message = new ResetNotificationsBadgeCount()
      message.send()
      yield call(AudiusBackend.clearNotificationBadges)
    }
  } catch (error) {
    console.error(error)
  }
}

// On Native App open and enter foreground, clear the notification badges
function* watchResetNotificationBadgeCount() {
  yield call(waitForBackendSetup)
  yield call(resetNotificationBadgeCount)
  yield takeEvery(MessageType.ENTER_FOREGROUND, resetNotificationBadgeCount)
}

function* watchMarkAllNotificationsViewed() {
  yield takeEvery(MessageType.MARK_ALL_NOTIFICATIONS_AS_VIEWED, function* () {
    yield put(notificationActions.markAllAsViewed())
  })
}

const sagas = () => {
  return [watchResetNotificationBadgeCount, watchMarkAllNotificationsViewed]
}

export default sagas
