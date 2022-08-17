import analyticsSagas from 'audius-client/src/common/store/analytics/sagas'
import backendSagas, { setupBackend } from 'common/store/backend/sagas'
import remoteConfig from 'common/store/remote-config/sagas'
import { all, fork } from 'typed-redux-saga'

import initKeyboardEvents from './keyboard/sagas'
import oauthSagas from './oauth/sagas'

export default function* rootSaga() {
  yield* fork(setupBackend)
  const sagas = [
    // config
    ...backendSagas(),
    ...analyticsSagas(),
    initKeyboardEvents,
    ...remoteConfig(),
    ...oauthSagas()
  ]

  yield* all(sagas.map(fork))
}
