import {
  withdrawUSDCActions,
  withdrawUSDCSelectors,
  solanaSelectors,
  ErrorLevel,
  SolanaWalletAddress,
  getTokenAccountInfo,
  isValidSolDestinationAddress,
  getUSDCUserBank,
  getContext
} from '@audius/common'
import BN from 'bn.js'
import { takeLatest } from 'redux-saga/effects'
import { call, put, select } from 'typed-redux-saga'

import { getOrCreateDestinationAssociatedTokenAccount } from 'services/audius-backend/WithdrawUSDC'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

const {
  beginWithdrawUSDC,
  setAmount,
  setAmountFailed,
  setAmountSucceeded,
  setDestinationAddress,
  setDestinationAddressFailed,
  setDestinationAddressSucceeded,
  withdrawUSDCFailed
} = withdrawUSDCActions
const { getWithdrawDestinationAddress, getWithdrawAmount } =
  withdrawUSDCSelectors
const { getFeePayer } = solanaSelectors

function* doSetAmount({ payload: { amount } }: ReturnType<typeof setAmount>) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  try {
    const amountBN = new BN(amount)
    if (amountBN.lte(new BN(0))) {
      throw new Error('Please enter a valid amount')
    }
    // get user bank
    const userBank = yield* call(getUSDCUserBank)
    const tokenAccountInfo = yield* call(
      getTokenAccountInfo,
      audiusBackendInstance,
      {
        mint: 'usdc',
        tokenAccount: userBank
      }
    )
    if (!tokenAccountInfo) {
      throw new Error('Failed to fetch USDC token account info')
    }
    if (tokenAccountInfo.amount.gt(amountBN)) {
      throw new Error(
        `Your USDC wallet does not have enough funds to cover this transaction.`
      )
    }
    yield* put(setAmountSucceeded({ amount }))
  } catch (e: unknown) {
    const reportToSentry = yield* getContext('reportToSentry')
    reportToSentry({
      level: ErrorLevel.Error,
      error: e as Error
    })
    yield* put(setAmountFailed({ error: e as Error }))
  }
}

function* doSetDestinationAddress({
  payload: { destinationAddress }
}: ReturnType<typeof setDestinationAddress>) {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  try {
    if (!destinationAddress) {
      throw new Error('Please enter a destination address')
    }
    const isValidAddress = yield* call(
      isValidSolDestinationAddress,
      audiusBackendInstance,
      destinationAddress as SolanaWalletAddress
    )
    if (!isValidAddress) {
      throw new Error('A valid Solana USDC wallet address is required.')
    }
    yield* put(setDestinationAddressSucceeded({ destinationAddress }))
  } catch (e: unknown) {
    const reportToSentry = yield* getContext('reportToSentry')
    reportToSentry({
      level: ErrorLevel.Error,
      error: e as Error
    })
    yield* put(setDestinationAddressFailed({ error: e as Error }))
  }
}

function* doWithdrawUSDC({ payload }: ReturnType<typeof beginWithdrawUSDC>) {
  yield* call(waitForLibsInit)
  try {
    // Assume destinationAddress and amount have already been validated
    const destinationAddress = yield* select(getWithdrawDestinationAddress)
    if (!destinationAddress) {
      throw new Error('Please enter a destination address')
    }
    const amount = yield* select(getWithdrawAmount)
    const feePayer = yield* select(getFeePayer)
    if (feePayer === null) {
      throw new Error('Fee payer not set')
    }
    const destinationATA = yield* call(
      getOrCreateDestinationAssociatedTokenAccount,
      destinationAddress,
      feePayer
    )
    // To get around unused variable error
    console.log(`amount to swap: ${amount}, destinationATA: ${destinationATA}`)
  } catch (e: unknown) {
    const reportToSentry = yield* getContext('reportToSentry')
    reportToSentry({
      level: ErrorLevel.Error,
      error: e as Error
    })
    yield* put(withdrawUSDCFailed({ error: e as Error }))
  }
}

function* watchSetAmount() {
  yield takeLatest(setAmount, doSetAmount)
}

function* watchSetDestinationAddress() {
  yield takeLatest(setDestinationAddress, doSetDestinationAddress)
}

function* watchBeginWithdrawUSDC() {
  yield takeLatest(beginWithdrawUSDC, doWithdrawUSDC)
}

export default function sagas() {
  return [watchSetAmount, watchSetDestinationAddress, watchBeginWithdrawUSDC]
}
