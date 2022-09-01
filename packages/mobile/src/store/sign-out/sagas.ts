import {
  Name,
  signOutActions,
  accountActions,
  getContext
} from '@audius/common'
import { make } from 'common/store/analytics/actions'
import { takeLatest, put, call } from 'typed-redux-saga'

import { resetOAuthState } from '../oauth/actions'
import { disablePushNotifications } from '../settings/sagas'

const { resetAccount } = accountActions
const { signOut: signOutAction } = signOutActions

function* watchSignOut() {
  yield* takeLatest(signOutAction.type, function* () {
    yield* put(resetAccount())
    yield* call(disablePushNotifications)
    yield* put(make(Name.SETTINGS_LOG_OUT, {}))

    const localStorage = yield* getContext('localStorage')
    const audiusBackendInstance = yield* getContext('audiusBackendInstance')

    yield* call([localStorage, 'clearAudiusAccount'])
    yield* call([localStorage, 'clearAudiusAccountUser'])
    yield* call([audiusBackendInstance, 'signOut'])
    yield* call([localStorage, 'removeItem'], 'theme')
    yield* put(resetOAuthState())
  })
}

export default function sagas() {
  return [watchSignOut]
}
