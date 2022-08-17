import { put, takeEvery } from 'redux-saga/effects'

import * as errorActions from 'common/store/errors/actions'
import { ERROR_PAGE } from 'utils/route'

import * as signOnActions from './actions'

const noRedirectSet = new Set([
  // Twitter failures are not fatal
  signOnActions.SET_TWITTER_PROFILE_ERROR,
  // Sign in errors are never fatal
  signOnActions.SIGN_IN_FAILED
])

function* handleSignOnError(
  action: ReturnType<
    typeof signOnActions.signUpFailed | typeof signOnActions.signInFailed
  >
) {
  const SIGN_UP_ERROR_PREFIX = 'SIGN_ON/SIGN_UP_ERROR_'
  const SIGN_IN_ERROR_PREFIX = 'SIGN_ON/SIGN_IN_ERROR_'

  // Determine whether the error should redirect to /error and whether it should report it.
  const shouldRedirect = !noRedirectSet.has(action.type)

  const redirectRoute =
    'redirectRoute' in action ? action.redirectRoute : ERROR_PAGE

  const shouldReport = 'shouldReport' in action ? action.shouldReport : true

  const shouldToast = 'shouldToast' in action ? action.shouldToast : false

  const errorType = (() => {
    // Compute the error type from the phase
    switch (action.type) {
      case signOnActions.SIGN_UP_FAILED:
        return `${SIGN_UP_ERROR_PREFIX}${action.phase}`
      case signOnActions.SIGN_IN_FAILED:
        return `${SIGN_IN_ERROR_PREFIX}${action.phase}`
      default:
        return action.type
    }
  })()

  const message = 'message' in action ? action.message ?? errorType : errorType

  yield put(
    errorActions.handleError({
      message,
      shouldRedirect,
      redirectRoute,
      shouldReport,
      shouldToast,
      additionalInfo: { errorMessage: action.error }
    })
  )
}

export function* watchSignOnError() {
  yield takeEvery(
    [
      signOnActions.SET_TWITTER_PROFILE_ERROR,
      signOnActions.SIGN_UP_FAILED,
      signOnActions.SIGN_UP_TIMEOUT,
      signOnActions.SIGN_IN_FAILED
    ],
    handleSignOnError
  )
}
