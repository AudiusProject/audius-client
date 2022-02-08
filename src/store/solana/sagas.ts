import { put, call, take, select } from 'typed-redux-saga'

import { fetchAccountSucceeded } from 'common/store/account/reducer'
import { getFeePayer } from 'common/store/solana/selectors'
import { setFeePayer } from 'common/store/solana/slice'
import AudiusBackend from 'services/AudiusBackend'

function* watchForFeePayer() {
  console.log('watching for fee payer')
  yield take(fetchAccountSucceeded.type)
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
