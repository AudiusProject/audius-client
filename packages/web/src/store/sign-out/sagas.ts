import {
  Name,
  signOutActions,
  getContext,
  accountActions
} from '@audius/common'
import { takeLatest, put } from 'redux-saga/effects'

import { make } from 'common/store/analytics/actions'
import { signOut } from 'store/sign-out/signOut'
const { resetAccount, unsubscribeBrowserPushNotifications } = accountActions
const { signOut: signOutAction } = signOutActions

function* watchSignOut() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const localStorage = yield* getContext('localStorage')
  yield takeLatest(signOutAction.type, function* () {
    yield put(resetAccount())
    yield put(unsubscribeBrowserPushNotifications())
    yield put(
      make(Name.SETTINGS_LOG_OUT, {
        callback: () => signOut(audiusBackendInstance, localStorage)
      })
    )
  })
}

export default function sagas() {
  return [watchSignOut]
}
