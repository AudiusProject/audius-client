/* eslint-disable new-cap */
import {
  IntKeys,
  Name,
  getContext,
  walletActions,
  convertWAudioToWei,
  formatWei,
  OnRampProvider,
  transactionDetailsActions,
  TransactionMetadataType,
  TransactionType,
  TransactionMethod,
  TransactionDetails,
  walletSelectors,
  BNWei,
  createUserBankIfNeeded,
  modalsActions,
  AmountObject,
  ErrorLevel,
  LocalStorage,
  solanaSelectors,
  deriveUserBankPubkey,
  convertWeiToWAudio
} from '@audius/common'
import { TransactionHandler } from '@audius/sdk/dist/core'
import { u64 } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey
} from '@solana/web3.js'
import BN from 'bn.js'
import { make } from 'common/store/analytics/actions'
import { isMobileWeb } from 'common/utils/isMobileWeb'
import dayjs from 'dayjs'
import JSBI from 'jsbi'
import { takeLatest, takeLeading } from 'redux-saga/effects'
import { track } from 'services/analytics'
import {
  createTransferToUserBankTransaction,
  getAssociatedTokenAccountInfo,
  getAssociatedTokenRentExemptionMinimum,
  getAudioAccount,
  getAudioAccountInfo,
  getRootAccountRentExemptionMinimum,
  getRootSolanaAccount,
  getSolanaConnection,
  getUserBankTransactionMetadata,
  pollForAudioBalanceChange,
  pollForNewTransaction,
  pollForSolBalanceChange,
  saveUserBankTransactionMetadata
} from 'services/audius-backend/BuyUSDC'
import { JupiterSingleton } from 'services/audius-backend/Jupiter'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { reportToSentry } from 'store/errors/reportToSentry'
import { call, select, put, take, race, fork } from 'typed-redux-saga'

import { waitForWrite } from 'utils/sagaHelpers'

import { getBuyUSDCFlowStage, getBuyUSDCProvider } from './selectors'
import {
  startBuyUSDCFlow,
  onRampOpened,
  onRampSucceeded,
  onRampCanceled,
  buyUSDCFlowFailed
} from './slice'

const { getFeePayer } = solanaSelectors

const { setVisibility } = modalsActions

const { increaseBalance } = walletActions
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions

// TODO: Do we need localStorage and recovery?

// const MEMO_MESSAGES = {
//   [OnRampProvider.COINBASE]: 'In-App $USDC Purchase: Coinbase Pay',
//   [OnRampProvider.STRIPE]: 'In-App $USDC Purchase: Link by Stripe',
//   [OnRampProvider.UNKNOWN]: 'In-App $USDC Purchase: Unknown'
// }

// const PROVIDER_METHOD_MAP: Record<
//   OnRampProvider,
//   | TransactionMethod.COINBASE
//   | TransactionMethod.STRIPE
//   | TransactionMethod.RECEIVE
// > = {
//   [OnRampProvider.COINBASE]: TransactionMethod.COINBASE,
//   [OnRampProvider.STRIPE]: TransactionMethod.STRIPE,
//   [OnRampProvider.UNKNOWN]: TransactionMethod.RECEIVE
// }

// TODO: Configurable min/max usdc purchase amounts?
// function* getBuyUSDCRemoteConfig() {
//   const DEFAULT_MIN_AUDIO_PURCHASE_AMOUNT = 5
//   const DEFAULT_MAX_AUDIO_PURCHASE_AMOUNT = 999
//   const remoteConfigInstance = yield* getContext('remoteConfigInstance')
//   yield* call([remoteConfigInstance, remoteConfigInstance.waitForRemoteConfig])
//   const minAudioAmount =
//     remoteConfigInstance.getRemoteVar(IntKeys.MIN_AUDIO_PURCHASE_AMOUNT) ??
//     DEFAULT_MIN_AUDIO_PURCHASE_AMOUNT
//   const maxAudioAmount =
//     remoteConfigInstance.getRemoteVar(IntKeys.MAX_AUDIO_PURCHASE_AMOUNT) ??
//     DEFAULT_MAX_AUDIO_PURCHASE_AMOUNT
//   const slippage =
//     remoteConfigInstance.getRemoteVar(IntKeys.BUY_AUDIO_SLIPPAGE) ??
//     DEFAULT_SLIPPAGE
//   const retryDelayMs =
//     remoteConfigInstance.getRemoteVar(IntKeys.BUY_AUDIO_WALLET_POLL_DELAY_MS) ??
//     undefined
//   const maxRetryCount =
//     remoteConfigInstance.getRemoteVar(
//       IntKeys.BUY_AUDIO_WALLET_POLL_MAX_RETRIES
//     ) ?? undefined
//   return {
//     minAudioAmount,
//     maxAudioAmount,
//     slippage,
//     maxRetryCount,
//     retryDelayMs
//   }
// }

type PurchaseStepParams = {
  estimatedSOL: AmountObject
  connection: Connection
  rootAccount: Keypair
  provider: OnRampProvider
  retryDelayMs?: number
  maxRetryCount?: number
}
/**
 * Executes the purchase step of the on-ramp
 *
 * @throws if cannot confirm the purchase
 * @returns the new USDC balance for the user bank after the purchase succeeds
 */
function* purchaseStep({
  estimatedSOL,
  connection,
  rootAccount,
  provider,
  retryDelayMs,
  maxRetryCount
}: PurchaseStepParams) {
  // Cache current SOL balance and tip of transaction history
  const initialBalance = yield* call(
    [connection, connection.getBalance],
    rootAccount.publicKey,
    'finalized'
  )
  const initialTransactions = yield* call(
    [connection, connection.getSignaturesForAddress],
    rootAccount.publicKey,
    {
      limit: 1
    }
  )
  const initialTransaction = initialTransactions?.[0]?.signature

  // Wait for on ramp finish
  const result = yield* race({
    success: take(onRampSucceeded),
    canceled: take(onRampCanceled)
  })

  // If the user didn't complete the on ramp flow, return early
  if (result.canceled) {
    yield* put(make(Name.BUY_AUDIO_ON_RAMP_CANCELED, { provider }))
    return {}
  }
  yield* put(make(Name.BUY_AUDIO_ON_RAMP_SUCCESS, { provider }))

  // Wait for the SOL funds to come through
  const newBalance = yield* call(pollForSolBalanceChange, {
    rootAccount: rootAccount.publicKey,
    initialBalance,
    retryDelayMs,
    maxRetryCount
  })

  // Get the purchase transaction
  const purchaseTransactionId = yield* call(pollForNewTransaction, {
    initialTransaction,
    rootAccount: rootAccount.publicKey,
    retryDelayMs,
    maxRetryCount
  })

  // Check that we got the requested SOL
  const purchasedLamports = new BN(newBalance).sub(new BN(initialBalance))
  if (purchasedLamports !== new BN(estimatedSOL.amount)) {
    console.warn(
      `Warning: Purchase SOL amount differs from expected. Actual: ${
        new BN(newBalance).sub(new BN(initialBalance)).toNumber() /
        LAMPORTS_PER_SOL
      } SOL. Expected: ${estimatedSOL.uiAmountString} SOL.`
    )
  }

  const [audiusLocalStorage, localStorageState] =
    yield* getLocalStorageStateWithFallback()
  localStorageState.transactionDetailsArgs.purchaseTransactionId =
    purchaseTransactionId
  localStorageState.transactionDetailsArgs.purchasedLamports =
    purchasedLamports.toString()
  yield* call(
    [audiusLocalStorage, audiusLocalStorage.setJSONValue],
    BUY_AUDIO_LOCAL_STORAGE_KEY,
    localStorageState
  )
  return { purchasedLamports, purchaseTransactionId, newBalance }
}

/**
 * Exchanges all but the minimum balance required for a swap from a wallet once a balance change is seen
 */
function* doBuyUSDC({
  payload: { desiredAudioAmount, estimatedSOL, estimatedUSD }
}: ReturnType<typeof onRampOpened>) {
  const provider = yield* select(getBuyUSDCProvider)
  let userRootWallet = ''
  try {
    // Record start
    yield* put(
      make(Name.BUY_AUDIO_ON_RAMP_OPENED, {
        provider
      })
    )

    // Initialize local storage
    const audiusLocalStorage = yield* getContext('localStorage')
    const initialState: BuyUSDCLocalStorageState = {
      ...defaultBuyUSDCLocalStorageState,
      transactionDetailsArgs: {
        ...defaultBuyUSDCLocalStorageState.transactionDetailsArgs,
        estimatedUSD: estimatedUSD.uiAmountString
      },
      provider,
      desiredAudioAmount
    }
    yield* call(
      [audiusLocalStorage, audiusLocalStorage.setJSONValue],
      BUY_AUDIO_LOCAL_STORAGE_KEY,
      initialState
    )

    // Setup
    const rootAccount: Keypair = yield* call(getRootSolanaAccount)
    const connection = yield* call(getSolanaConnection)
    const transactionHandler = new TransactionHandler({
      connection,
      useRelay: false,
      feePayerKeypairs: [rootAccount],
      skipPreflight: false
    })
    userRootWallet = rootAccount.publicKey.toString()

    // Get config
    const { retryDelayMs, maxRetryCount, slippage } = yield* call(
      getBuyUSDCRemoteConfig
    )

    // Ensure userbank is created
    const feePayerOverride = yield* select(getFeePayer)
    if (!feePayerOverride) {
      console.error('doBuyUSDC: unexpectedly no fee payer override')
      return
    }
    yield* fork(function* () {
      yield* call(
        createUserBankIfNeeded,
        track,
        audiusBackendInstance,
        feePayerOverride
      )
    })

    // STEP ONE: Wait for purchase
    // Have to do some typescript finangling here due to the "race" effect in purchaseStep
    // See https://github.com/agiledigital/typed-redux-saga/issues/43
    const { newBalance } = (yield* call(purchaseStep, {
      provider,
      estimatedSOL,
      connection,
      rootAccount,
      retryDelayMs,
      maxRetryCount
    }) as unknown as ReturnType<typeof purchaseStep>)!

    // If the user canceled the purchase, stop the flow
    if (newBalance === undefined) {
      return
    }

    // Get dummy quote to calculate fees and get exchange amount
    const quote = yield* call(JupiterSingleton.getQuote, {
      inputTokenSymbol: 'SOL',
      outputTokenSymbol: 'AUDIO',
      inputAmount: newBalance / LAMPORTS_PER_SOL,
      slippage
    })
    const { totalFees } = yield* call(getSwapFees, { route: quote.route })
    const exchangeAmount = new BN(newBalance).sub(totalFees)
    console.debug(
      `Exchanging ${exchangeAmount.toNumber() / LAMPORTS_PER_SOL} SOL to AUDIO`
    )

    // STEP TWO: Swap to $AUDIO
    const { audioSwappedSpl } = yield* call(swapStep, {
      exchangeAmount,
      desiredAudioAmount,
      rootAccount,
      transactionHandler,
      retryDelayMs,
      maxRetryCount
    })

    // STEP THREE: Transfer $AUDIO to user bank
    const { audioTransferredWei } = yield* call(transferStep, {
      transferAmount: audioSwappedSpl,
      transactionHandler,
      rootAccount,
      provider
    })

    // Save transaction details
    yield* call(populateAndSaveTransactionDetails)

    // Record success
    yield* put(
      make(Name.BUY_AUDIO_SUCCESS, {
        provider,
        requestedAudio: desiredAudioAmount.uiAmount,
        actualAudio: parseFloat(
          formatWei(audioTransferredWei).replaceAll(',', '')
        ),
        surplusAudio: parseFloat(
          formatWei(
            convertWAudioToWei(
              audioSwappedSpl.sub(new u64(desiredAudioAmount.amount))
            )
          ).replaceAll(',', '')
        )
      })
    )
  } catch (e) {
    const stage = yield* select(getBuyUSDCFlowStage)
    yield* call(reportToSentry, {
      level: ErrorLevel.Error,
      error: e as Error,
      additionalInfo: { stage, userRootWallet }
    })
    yield* put(buyUSDCFlowFailed())
    yield* put(
      make(Name.BUY_AUDIO_FAILURE, {
        provider,
        stage,
        requestedAudio: desiredAudioAmount.uiAmount,
        name: 'BuyUSDC failed',
        error: (e as Error).message
      })
    )
  }
}

function* doStartBuyUSDCFlow(action: ReturnType<typeof startBuyUSDCFlow>) {
  // This is a placeholder action to handle a general buy usdc flow.
  // For now, it will just open the onramp using the provided values
  yield* put(onRampOpened(action.payload.purchaseInfo))
}

function* watchOnRampOpened() {
  yield takeLatest(onRampOpened, doBuyUSDC)
}

function* watchStartBuyUSDCFlow() {
  yield takeLatest(startBuyUSDCFlow, doStartBuyUSDCFlow)
}

export default function sagas() {
  return [watchOnRampOpened, watchStartBuyUSDCFlow]
}
