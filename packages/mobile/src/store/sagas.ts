import { remoteConfigSagas as remoteConfig } from '@audius/common'
// import analyticsSagas from 'audius-client/src/common/store/analytics/sagas'
// import accountSagas from 'common/store/account/sagas'
// import backendSagas from 'common/store/backend/sagas'
// import collectionsSagas from 'common/store/cache/collections/sagas'
// import coreCacheSagas from 'common/store/cache/sagas'
// import tracksSagas from 'common/store/cache/tracks/sagas'
// import usersSagas from 'common/store/cache/users/sagas'
// import confirmerSagas from 'common/store/confirmer/sagas'
// import signOnSagas from 'common/store/pages/signon/sagas'
// import signOutSagas from 'common/store/sign-out/sagas'
// import tippingSagas from 'common/store/tipping/sagas'
// import walletSagas from 'common/store/wallet/sagas'
import { all, fork } from 'typed-redux-saga'

import initKeyboardEvents from './keyboard/sagas'
import oauthSagas from './oauth/sagas'

export default function* rootSaga() {
  // yield* fork(setupBackend)
  const sagas = [
    // config
    // ...backendSagas(),
    // ...analyticsSagas(),
    // ...accountSagas(),
    // ...confirmerSagas(),

    // // Cache
    // ...coreCacheSagas(),
    // ...collectionsSagas(),
    // ...tracksSagas(),
    // ...usersSagas(),

    // // Sign in / Sign out
    // ...signOnSagas(),
    // ...signOutSagas(),

    // // Tipping
    // ...tippingSagas(),

    // ...walletSagas(),

    initKeyboardEvents,
    ...remoteConfig(),
    ...oauthSagas()
  ]

  yield* all(sagas.map(fork))
}
