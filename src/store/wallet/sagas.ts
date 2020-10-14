import { all, call, put, takeEvery } from 'redux-saga/effects'
import {
  getBalance,
  getClaim,
  setBalance,
  setClaim,
  claim,
  getClaimableBalance,
  increaseBalance,
  claimSucceeded,
  claimFailed,
  send,
  getAccountBalance,
  decreaseBalance
} from 'store/wallet/slice'
import walletClient from 'services/wallet-client/WalletClient'
import BN from 'bn.js'
import { select } from 'redux-saga-test-plan/matchers'

// TODO: handle errors

function* sendAsync({
  payload: { recipientWallet, amount }
}: ReturnType<typeof send>) {
  const bnAmount = new BN(amount)
  const balance: ReturnType<typeof getAccountBalance> = yield select(
    getAccountBalance
  )
  if (!balance || !balance.gte(bnAmount)) return
  yield all([
    call(() => walletClient.sendTokens(recipientWallet, bnAmount)),
    put(decreaseBalance({ amount }))
  ])
}

function* claimAsync() {
  const balance: ReturnType<typeof getClaimableBalance> = yield select(
    getClaimableBalance
  )
  if (!balance || !balance.gt(new BN(0))) return
  try {
    yield call(() => walletClient.claim())
    yield all([
      put(setClaim({ balance: '0' })),
      put(increaseBalance({ amount: balance.toString() })),
      put(claimSucceeded())
    ])
  } catch (e) {
    yield put(claimFailed({ error: e.message }))
  }
}

function* fetchBalanceAsync() {
  const currentBalance: BN = yield call(() => walletClient.getCurrentBalance())
  yield put(setBalance({ balance: currentBalance.toString() }))
}

function* fetchClaimsAsync() {
  const pendingClaims: BN = yield call(() => walletClient.getClaimableBalance())
  yield put(setClaim({ balance: pendingClaims.toString() }))
}

function* watchSend() {
  yield takeEvery(send.type, sendAsync)
}

function* watchClaim() {
  yield takeEvery(claim.type, claimAsync)
}

function* watchGetBalance() {
  yield takeEvery(getBalance.type, fetchBalanceAsync)
}

function* watchGetClaims() {
  yield takeEvery(getClaim.type, fetchClaimsAsync)
}

const sagas = () => {
  return [watchGetBalance, watchGetClaims, watchClaim, watchSend]
}

export default sagas
