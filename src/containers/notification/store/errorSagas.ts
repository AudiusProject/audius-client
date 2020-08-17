import * as notificationActions from './actions'
import * as errorActions from 'store/errors/actions'
import { put, takeEvery } from 'redux-saga/effects'

const noRedirectSet = new Set([
  // Failed to fetch notifications
  notificationActions.FETCH_NOTIFICATIONS_FAILED
])

type ErrorAction =
  | notificationActions.FetchNotificationsFailed
  | notificationActions.FetchNotificationUsersFailed

function* handleFetchNotificationError(action: ErrorAction) {
  // Determine whether the error should redirect to /error and whether it should report it.
  const shouldRedirect = !noRedirectSet.has(action.type)
  let shouldReport = true
  if ('shouldReport' in action) shouldReport = !!action.shouldReport

  yield put(
    errorActions.handleError({
      message: action.type,
      shouldRedirect,
      shouldReport,
      additionalInfo: { errorMessage: action.message },
      level: errorActions.Level.Warning
    })
  )
}

export function* watchNotificationError() {
  yield takeEvery(
    [notificationActions.FETCH_NOTIFICATIONS_FAILED],
    handleFetchNotificationError
  )
}
