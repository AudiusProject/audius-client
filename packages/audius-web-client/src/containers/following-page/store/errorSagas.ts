import { GET_FOLLOWING_ERROR, getFollowingError } from './actions'
import { put, takeEvery } from 'redux-saga/effects'
import * as errorActions from 'store/errors/actions'

type ErrorActions = ReturnType<typeof getFollowingError>

export function* handleFollowingError(action: ErrorActions) {
  yield put(
    errorActions.handleError({
      message: action.type,
      shouldRedirect: true,
      shouldReport: true,
      additionalInfo: {
        errorMessage: action.error,
        id: action.id
      }
    })
  )
}

export function* watchFollowingError() {
  yield takeEvery([GET_FOLLOWING_ERROR], handleFollowingError)
}
