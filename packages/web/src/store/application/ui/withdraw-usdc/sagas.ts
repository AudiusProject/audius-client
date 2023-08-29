import {
  withdrawUSDCActions,
  withdrawUSDCSelectors,
  solanaSelectors,
  ErrorLevel,
  SolanaWalletAddress,
  getUSDCUserBank,
  getContext,
  TOKEN_LISTING_MAP
} from '@audius/common'
import { TransactionHandler } from '@audius/sdk/dist/core'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token
} from '@solana/spl-token'
import { PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import BN from 'bn.js'
import { takeLatest } from 'redux-saga/effects'
import { call, put, select } from 'typed-redux-saga'

import { getLibs } from 'services/audius-libs'
import {
  addCreateAssociatedTokenAccountInstructionToTransaction,
  getSwapUSDCUserBankInstructions,
  getWithdrawUSDCInstructions
} from 'services/solana/WithdrawUSDC'
import {
  isSolWallet,
  getTokenAccountInfo,
  isValidSolAddress,
  getRootSolanaAccount,
  getNewTransaction,
  addTransferInstructionToTransaction,
  getSignatureForTransaction,
  getRecentBlockhash
} from 'services/solana/solana'

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
const { getWithdrawAmount, getWithdrawDestinationAddress } =
  withdrawUSDCSelectors
const { getFeePayer } = solanaSelectors

function* doSetAmount({ payload: { amount } }: ReturnType<typeof setAmount>) {
  try {
    const amountBN = new BN(amount)
    if (amountBN.lte(new BN(0))) {
      throw new Error('Please enter a valid amount')
    }
    // get user bank
    const userBank = yield* call(getUSDCUserBank)
    const tokenAccountInfo = yield* call(getTokenAccountInfo, {
      tokenAccount: userBank,
      mint: 'usdc'
    })
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
  try {
    if (!destinationAddress) {
      throw new Error('Please enter a destination address')
    }
    const isValidAddress = yield* call(
      isValidSolAddress,
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
  try {
    const libs = yield* call(getLibs)
    // Assume destinationAddress and amount have already been validated
    // const amount = yield* select(getWithdrawAmount)
    const amount = 1
    // const destinationAddress = yield* select(getWithdrawDestinationAddress)
    const destinationAddress = '4d5U11uroz3ZFHjxjYKyJReGPJ3yE5kGTf2NSTXb2QWF'
    if (!destinationAddress) {
      throw new Error('Please enter a destination address')
    }
    const feePayer = yield* select(getFeePayer)
    if (feePayer === null) {
      throw new Error('Fee payer not set')
    }
    const transactionHandler = libs.solanaWeb3Manager?.transactionHandler
    const connection = libs.solanaWeb3Manager?.connection
    if (!connection) {
      throw new Error('Failed to get connection')
    }
    const rootSolanaAccount = yield* call(getRootSolanaAccount)
    // const transactionHandler = new TransactionHandler({
    //   connection,
    //   useRelay: true,
    //   feePayerKeypairs: [rootSolanaAccount],
    //   skipPreflight: false
    // })
    if (!transactionHandler) {
      throw new Error('Failed to get transaction handler')
    }

    let destinationPubkey = new PublicKey(destinationAddress)
    const feePayerPubkey = new PublicKey(feePayer)
    // const tx = yield* call(getNewTransaction)

    const isDestinationSolAddress = yield* call(
      isSolWallet,
      destinationAddress as SolanaWalletAddress
    )
    // Destination is a sol address - check for associated token account
    if (isDestinationSolAddress) {
      const destinationTokenPubkey = yield* call(
        [Token, Token.getAssociatedTokenAddress],
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        libs.solanaWeb3Manager!.mints.usdc,
        destinationPubkey
      )
      destinationPubkey = destinationTokenPubkey
      const tokenAccountInfo = yield* call(getTokenAccountInfo, {
        tokenAccount: destinationTokenPubkey,
        mint: 'usdc'
      })
      // Destination associated token account does not exist - create and fund it
      if (tokenAccountInfo === null) {
        const swapInstructions = yield* call(getSwapUSDCUserBankInstructions, {
          destinationAddress,
          feePayer: feePayerPubkey
        })
        swapInstructions.forEach((instruction) => {
          const filtered = instruction.keys?.filter((k) => k.isSigner)
          console.debug(filtered[0]?.pubkey?.toString())
        })
        const recentBlockhash = yield* call(getRecentBlockhash)
        const signatureWithPubkey = yield* call(getSignatureForTransaction, {
          instructions: swapInstructions,
          signer: rootSolanaAccount,
          feePayer: feePayerPubkey,
          recentBlockhash
        })
        const { res: swapRes, error: swapError } = yield* call(
          [transactionHandler, transactionHandler.handleTransaction],
          {
            instructions: swapInstructions,
            feePayerOverride: feePayerPubkey,
            skipPreflight: false,
            signatures: signatureWithPubkey.map((s) => ({
              signature: s.signature!,
              publicKey: s.publicKey.toString()
            })),
            recentBlockhash
          }
        )
        if (swapError) {
          throw new Error(`Swap transaction failed: ${swapError}`)
        }

        // yield* call(addCreateAssociatedTokenAccountInstructionToTransaction, {
        //   destinationTokenAccountAddress: destinationTokenPubkey,
        //   destinationSolAddress: destinationPubkey,
        //   transaction: tx
        // })
        // yield* call(
        //   sendAndConfirmTransaction,
        //   libs.solanaWeb3Manager!.connection,
        //   tx,
        //   [rootSolanaAccount]
        // )
      }
    } else {
      // If destination is not a sol address, check if it's a valid token address
      const tokenAccountInfo = yield* call(getTokenAccountInfo, {
        tokenAccount: destinationPubkey,
        mint: 'usdc'
      })
      if (tokenAccountInfo === null) {
        throw new Error('Destination account does not exist')
      }
    }

    // const withdrawInstructions = yield* call(getWithdrawUSDCInstructions, {
    //   amount: amount * TOKEN_LISTING_MAP.USDC.decimals,
    //   destinationAddress,
    //   feePayer
    // })
    // const { error: withdrawError } = yield* call(
    //   [transactionHandler, transactionHandler.handleTransaction],
    //   {
    //     instructions: withdrawInstructions,
    //     feePayerOverride: feePayerPubkey,
    //     skipPreflight: false
    //   }
    // )
    // if (withdrawError) {
    //   throw new Error(`Swap transaction failed: ${withdrawError}`)
    // }
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
