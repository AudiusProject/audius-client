import { call, put } from 'typed-redux-saga'

import { audiusBackendInstance } from 'app/services/audius-backend-instance'

export function* setupBackend() {
  const { libsError } = yield* call([audiusBackendInstance, 'setup'])
  if (libsError) {
    console.log('libs error!')
    // yield* put(accountActions.fetchAccountFailed({ reason: 'LIBS_ERROR' }))
    // yield* put(backendActions.setupBackendFailed())
    // yield* put(backendActions.libsError(libsError))
    return
  }
  console.log('okay we setup backend, nice')
  yield* put(backendActions.setupBackendSucceeded())
}
