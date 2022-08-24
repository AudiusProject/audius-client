import * as notificationActions from 'audius-client/src/common/store/notifications/actions'
import { takeEvery } from 'typed-redux-saga'

import PushNotifications from 'app/notifications'

function* watchMarkedAllNotificationsViewed() {
  yield* takeEvery(
    notificationActions.MARK_ALL_AS_VIEWED,
    markedAllNotificationsViewed
  )
}

export function* markedAllNotificationsViewed() {
  PushNotifications.setBadgeCount(0)
}

export default function sagas() {
  return [watchMarkedAllNotificationsViewed]
}
