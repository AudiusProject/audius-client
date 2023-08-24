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
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { takeLatest } from 'redux-saga/effects'
import { call, put, select } from 'typed-redux-saga'

import { getLibs } from 'services/audius-libs'
import { getSwapUSDCUserBankInstructions } from 'services/solana/WithdrawUSDC'
import { isSolWallet } from 'services/solana/solana'

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

async function* doWithdrawUSDC({
  payload
}: ReturnType<typeof beginWithdrawUSDC>) {
  try {
    const libs = yield* call(getLibs)
    // Assume destinationAddress and amount have already been validated
    const amount = yield* select(getWithdrawAmount)
    // const destinationAddress = yield* select(getWithdrawDestinationAddress)
    const destinationAddress = '4d5U11uroz3ZFHjxjYKyJReGPJ3yE5kGTf2NSTXb2QWF'
    if (!destinationAddress) {
      throw new Error('Please enter a destination address')
    }
    const destinationPubkey = new PublicKey(destinationAddress)
    const feePayer = yield* select(getFeePayer)
    if (feePayer === null) {
      throw new Error('Fee payer not set')
    }
    const feePayerPubkey = new PublicKey(feePayer)

    const isDestinationSolAddress = yield* call(
      isSolWallet,
      destinationAddress as SolanaWalletAddress
    )

    // Destination is a sol address - check for associated token account
    if (isDestinationSolAddress) {
      const destinationAssociatedTokenAccount = yield* call(
        [Token, Token.getAssociatedTokenAddress],
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        libs.solanaWeb3Manager!.mints.usdc,
        destinationPubkey
      )
      const destinationAccountInfo = yield* call(
        [
          libs,
          libs.solanaWeb3Manager,
          libs.solanaWeb3Manager.getTokenAccountInfo
        ],
        destinationAssociatedTokenAccount.toString(),
        'usdc'
      )

      // Destination associated token account does not exist - create and fund it
      if (destinationAccountInfo === null) {
        const swapInstructions = yield* call(
          getSwapUSDCUserBankInstructions,
          destinationAddress,
          feePayer
        )

        const transactionHandler = libs.solanaWeb3Manager?.transactionHandler
        if (!transactionHandler) {
          throw new Error('Failed to get transaction handler')
        }
        const { error: swapError } = yield* call(
          [transactionHandler, transactionHandler.handleTransaction],
          {
            instructions: swapInstructions,
            feePayerOverride: feePayerPubkey,
            skipPreflight: false
          }
        )
        if (swapError) {
          console.debug(
            `Swap transaction stringified: ${JSON.stringify(swapInstructions)}`
          )
          throw new Error(`Swap transaction failed: ${swapError}`)
        }
      }
    }
    // TODO: handle case where destination is a USDC associated token account
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
