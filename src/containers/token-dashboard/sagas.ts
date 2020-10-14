import { select } from 'redux-saga-test-plan/matchers'
import { all, put, race, take, takeEvery } from 'redux-saga/effects'
import {
  pressClaim,
  pressSend,
  setModalState,
  setModalVisibility,
  ModalState,
  inputSendData,
  confirmSend,
  getSendData
} from './slice'
import {
  claim as walletClaim,
  send as walletSend,
  claimSucceeded,
  claimFailed,
  getClaimableBalance
} from 'store/wallet/slice'

function* send() {
  // Set modal state to input
  const inputStage: ModalState = {
    stage: 'SEND',
    sendingState: {
      stage: 'INPUT'
    }
  }
  yield all([
    put(setModalVisibility({ isVisible: true })),
    put(setModalState({ modalState: inputStage }))
  ])

  // Await input + confirmation
  yield take(inputSendData.type)
  yield take(confirmSend.type)

  // Send the txn, update local balance
  const sendData: ReturnType<typeof getSendData> = yield select(getSendData)
  if (!sendData) return
  const { recipientWallet, amount } = sendData
  yield put(walletSend({ recipientWallet, amount: amount.toString() }))
}

function* claim() {
  const claimableBalance: ReturnType<typeof getClaimableBalance> = yield select(
    getClaimableBalance
  )
  if (!claimableBalance) return

  const claimingState: ModalState = {
    stage: 'CLAIM',
    claimState: {
      stage: 'CLAIMING'
    }
  }

  // Set loading state
  yield all([
    // Set modal state
    put(setModalVisibility({ isVisible: true })),
    put(setModalState({ modalState: claimingState }))
  ])

  yield put(walletClaim())
  const { error }: { error: ReturnType<typeof claimFailed> } = yield race({
    success: take(claimSucceeded),
    error: take(claimFailed)
  })

  if (error) {
    const errorState: ModalState = {
      stage: 'CLAIM',
      claimState: {
        stage: 'ERROR',
        error: error.payload.error ?? ''
      }
    }
    yield put(setModalState({ modalState: errorState }))
    return
  }

  // Set modal state + new token + claim balances
  const claimedState: ModalState = {
    stage: 'CLAIM',
    claimState: {
      stage: 'SUCCESS'
    }
  }
  yield put(setModalState({ modalState: claimedState }))
}

function* watchPressSend() {
  yield takeEvery(pressSend.type, send)
}

function* watchPressClaim() {
  yield takeEvery(pressClaim.type, claim)
}
const sagas = () => {
  return [watchPressClaim, watchPressSend]
}

export default sagas
