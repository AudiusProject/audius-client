import { put, call, take, select } from 'typed-redux-saga'

import { getFeePayer } from 'common/store/solana/selectors'
import { setFeePayer } from 'common/store/solana/slice'
import AudiusBackend from 'services/AudiusBackend'
import * as backendActions from 'store/backend/actions'

function* watchForFeePayer() {
  console.log('watching for fee payer')
  yield take(backendActions.SETUP_BACKEND_SUCCEEDED)
  const { feePayer, error } = yield* call(AudiusBackend.getRandomFeePayer)
  if (!error) {
    yield put(setFeePayer({ feePayer }))
    console.log('the fee payer', yield* select(getFeePayer))
  }
}

const sagas = () => {
  return [watchForFeePayer]
}

export default sagas
