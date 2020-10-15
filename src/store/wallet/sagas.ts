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
  decreaseBalance,
  stringWeiToBN,
  weiToString,
  BNWei
} from 'store/wallet/slice'
import walletClient from 'services/wallet-client/WalletClient'
import { select } from 'redux-saga-test-plan/matchers'

// TODO: handle errors

function* sendAsync({
  payload: { recipientWallet, amount }
}: ReturnType<typeof send>) {
  const weiBNAmount = stringWeiToBN(amount)
  const weiBNBalance: ReturnType<typeof getAccountBalance> = yield select(
    getAccountBalance
  )
  if (!weiBNBalance || !weiBNBalance.gte(weiBNAmount)) return
  yield all([
    call(() => walletClient.sendTokens(recipientWallet, weiBNAmount)),
    put(decreaseBalance({ amount }))
  ])
}

function* claimAsync() {
  const weiBNClaimable: ReturnType<typeof getClaimableBalance> = yield select(
    getClaimableBalance
  )
  if (!weiBNClaimable || weiBNClaimable.isZero()) return
  try {
    yield call(() => walletClient.claim())
    yield all([
      put(setClaim({ balance: weiToString(weiBNClaimable) })),
      put(increaseBalance({ amount: weiToString(weiBNClaimable) })),
      put(claimSucceeded())
    ])
  } catch (e) {
    yield put(claimFailed({ error: e.message }))
  }
}

function* fetchBalanceAsync() {
  const currentBalance: BNWei = yield call(() =>
    walletClient.getCurrentBalance()
  )
  yield put(setBalance({ balance: weiToString(currentBalance) }))
}

function* fetchClaimsAsync() {
  const pendingClaims: BNWei = yield call(() =>
    walletClient.getClaimableBalance()
  )
  yield put(setClaim({ balance: weiToString(pendingClaims) }))
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
