import { Name, signOutActions, accountActions } from '@audius/common'
import { setupBackend } from 'audius-client/src/common/store/backend/actions'
import { make } from 'common/store/analytics/actions'
import { takeLatest, put, call } from 'typed-redux-saga'

import { audiusBackendInstance } from 'app/services/audius-backend-instance'
import { localStorage } from 'app/services/local-storage'

import { resetOAuthState } from '../oauth/actions'
import { clearHistory } from '../search/actions'
import { disablePushNotifications } from '../settings/sagas'

const { resetAccount } = accountActions
const { signOut: signOutAction } = signOutActions

function* watchSignOut() {
  yield* takeLatest(signOutAction.type, function* () {
    yield* put(make(Name.SETTINGS_LOG_OUT, {}))

    yield* call(disablePushNotifications)
    yield* call([localStorage, 'clearAudiusAccount'])
    yield* call([localStorage, 'clearAudiusAccountUser'])
    yield* call([audiusBackendInstance, 'signOut'])
    yield* call([localStorage, 'removeItem'], 'theme')

    yield* put(resetAccount())
    yield* put(clearHistory())
    yield* put(resetOAuthState())

    // On web we reload the page to get the app into a state
    // where it is acting like first-load. On mobile, in order to
    // get the same behavior, call to set up the backend again,
    // which will discover that we have no account
    yield* put(setupBackend())
  })
}

export default function sagas() {
  return [watchSignOut]
}
