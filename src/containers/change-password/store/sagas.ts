import { delay } from 'redux-saga'
import { call, put, takeEvery } from 'redux-saga/effects'

import AudiusBackend from 'services/AudiusBackend'
import { waitForBackendSetup } from 'store/backend/sagas'

import {
  confirmCredentials,
  confirmCredentialsCompleted,
  changePassword,
  changePasswordCompleted
} from './slice'

function* handleConfirmCredentials(
  action: ReturnType<typeof confirmCredentials>
) {
  yield call(waitForBackendSetup)
  const confirmed: boolean = yield call(
    AudiusBackend.confirmCredentials,
    action.payload.email,
    action.payload.password
  )
  yield put(confirmCredentialsCompleted({ success: confirmed }))
}

function* handleChangePassword(action: ReturnType<typeof changePassword>) {
  yield call(waitForBackendSetup)
  try {
    yield call(
      AudiusBackend.changePassword,
      action.payload.email,
      action.payload.password,
      action.payload.oldPassword
    )
    yield put(changePasswordCompleted({ success: true }))
  } catch {
    yield put(changePasswordCompleted({ success: false }))
  }
}

function* watchConfirmCredentials() {
  yield takeEvery(confirmCredentials, handleConfirmCredentials)
}

function* watchChangePassword() {
  yield takeEvery(changePassword, handleChangePassword)
}

export default function sagas() {
  return [watchConfirmCredentials, watchChangePassword]
}
