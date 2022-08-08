import remoteConfig from 'audius-client/src/common/store/remote-config/sagas'
import { all, fork } from 'typed-redux-saga'

import { remoteConfigInstance } from 'app/services/remote-config/remote-config-instance'

import { setupBackend } from './backend/sagas'
import initKeyboardEvents from './keyboard/sagas'
import oauthSagas from './oauth/sagas'

export default function* rootSaga() {
  yield* fork(setupBackend)
  const sagas = [
    initKeyboardEvents,
    ...remoteConfig(remoteConfigInstance),
    ...oauthSagas()
  ]
  yield* all(sagas.map(fork))
}
