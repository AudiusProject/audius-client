import {
  IntKeys,
  Name,
  getContext,
  walletActions,
  convertJSBIToAmountObject,
  convertWAudioToWei,
  formatWei,
  weiToString,
  TOKEN_LISTING_MAP,
  buyAudioSelectors,
  PurchaseInfoErrorType,
  buyAudioActions,
  OnRampProvider,
  transactionDetailsActions,
  TransactionMetadataType,
  TransactionType,
  TransactionMethod,
  TransactionDetails,
  walletSelectors,
  StringWei,
  BNWei,
  createUserBankIfNeeded,
  deriveUserBank,
  modalsActions,
  AmountObject
} from '@audius/common'
import { TransactionHandler } from '@audius/sdk/dist/core'
import type { RouteInfo } from '@jup-ag/core'
import { u64 } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey
} from '@solana/web3.js'
import BN from 'bn.js'
import dayjs from 'dayjs'
import JSBI from 'jsbi'
import { takeLatest } from 'redux-saga/effects'
import { call, select, put, take, race, fork } from 'typed-redux-saga'

import { make } from 'common/store/analytics/actions'
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
  pollForSolBalanceChange,
  saveUserBankTransactionMetadata
} from 'services/audius-backend/BuyAudio'
import { JupiterSingleton } from 'services/audius-backend/Jupiter'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'

const {
  calculateAudioPurchaseInfo,
  calculateAudioPurchaseInfoSucceeded,
  cacheAssociatedTokenAccount,
  cacheTransactionFees,
  startBuyAudioFlow,
  onRampOpened,
  onRampSucceeded,
  onRampCanceled,
  swapCompleted,
  swapStarted,
  transferStarted,
  transferCompleted,
  clearFeesCache,
  calculateAudioPurchaseInfoFailed,
  buyAudioFlowFailed
} = buyAudioActions

const { setVisibility } = modalsActions

const { getBuyAudioFlowStage, getFeesCache, getBuyAudioProvider } =
  buyAudioSelectors
const { increaseBalance } = walletActions
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions

const SLIPPAGE = 3 // The slippage amount to allow for exchanges
const BUY_AUDIO_LOCAL_STORAGE_KEY = 'buy-audio-transaction-details'

const MEMO_MESSAGES = {
  [OnRampProvider.COINBASE]: 'In-App $AUDIO Purchase: Coinbase',
  [OnRampProvider.STRIPE]: 'In-App $AUDIO Purchase: Stripe',
  [OnRampProvider.UNKNOWN]: 'In-App $AUDIO Purchase: Unknown'
}

const PROVIDER_METHOD_MAP: Record<
  OnRampProvider,
  | TransactionMethod.COINBASE
  | TransactionMethod.STRIPE
  | TransactionMethod.RECEIVE
> = {
  [OnRampProvider.COINBASE]: TransactionMethod.COINBASE,
  [OnRampProvider.STRIPE]: TransactionMethod.STRIPE,
  [OnRampProvider.UNKNOWN]: TransactionMethod.RECEIVE
}

type BuyAudioLocalStorageState = {
  transactionDetailsArgs: {
    purchaseTransactionId?: string
    setupTransactionId?: string
    swapTransactionId?: string
    cleanupTransactionId?: string
    transferTransactionId?: string
    estimatedUSD?: string
    purchasedLamports?: string
    purchasedAudioWei?: string
  }
  provider?: OnRampProvider
  desiredAudioAmount?: AmountObject
}
const defaultBuyAudioLocalStorageState: BuyAudioLocalStorageState = {
  transactionDetailsArgs: {
    purchaseTransactionId: '',
    swapTransactionId: '',
    transferTransactionId: '',
    estimatedUSD: '',
    purchasedLamports: '',
    purchasedAudioWei: ''
  },
  provider: OnRampProvider.UNKNOWN
}

/**
 * Checks if the associated accounts necessary for a quoted `route` exist on `rootAccount`,
 * and for those that don't, estimates the needed lamports to pay for rent exemption as they are created.
 * Uses the redux store to cache the result.
 * @returns the total amount of lamports necessary for all ATA creation rent fees in a swap and transfer
 */
function* getAssociatedAccountCreationFees({
  route,
  rootAccount,
  feesCache
}: {
  route: RouteInfo
  rootAccount: PublicKey
  feesCache: ReturnType<typeof getFeesCache>
}) {
  const mintKeysSet = new Set<PublicKey>()
  for (const marketInfo of route.marketInfos) {
    mintKeysSet.add(marketInfo.inputMint)
    mintKeysSet.add(marketInfo.outputMint)
  }
  const minRentForATA = yield* call(getAssociatedTokenRentExemptionMinimum)
  let accountCreationFees = 0
  for (const mintKey of mintKeysSet.values()) {
    const exists = feesCache?.associatedTokenAccountCache[mintKey.toString()]
    if (exists === false) {
      accountCreationFees += minRentForATA
    } else if (exists === undefined) {
      const accountInfo = yield* call(getAssociatedTokenAccountInfo, {
        rootAccount,
        mintKey
      })
      yield* put(
        cacheAssociatedTokenAccount({
          account: mintKey.toString(),
          exists: accountInfo !== null
        })
      )
      if (accountInfo === null) {
        accountCreationFees += minRentForATA
      }
    }
  }
  return accountCreationFees
}

/**
 * Creates the transactions necessary for a swap and transfer to calculate transaction fees
 * @returns the total amount of lamports necessary for all transaction fees in a swap and transfer
 */
function* getTransactionFees({
  route,
  rootAccount,
  feesCache
}: {
  route: RouteInfo
  rootAccount: PublicKey
  feesCache: ReturnType<typeof getFeesCache>
}) {
  let transactionFees = feesCache?.transactionFees ?? 0
  if (!transactionFees) {
    const {
      transactions: { setupTransaction, swapTransaction, cleanupTransaction }
    } = yield* call(JupiterSingleton.exchange, {
      routeInfo: route,
      userPublicKey: rootAccount
    })
    const userBank = yield* call(deriveUserBank, audiusBackendInstance)
    const transferTransaction = yield* call(
      createTransferToUserBankTransaction,
      {
        userBank,
        fromAccount: rootAccount,
        // eslint-disable-next-line new-cap
        amount: new u64(JSBI.toNumber(route.outAmount)),
        // The provider here doesn't matter, we're not sending this transaction
        memo: MEMO_MESSAGES[OnRampProvider.COINBASE]
      }
    )
    const connection = yield* call(getSolanaConnection)
    const latestBlockhashResult = yield* call(
      [connection, connection.getLatestBlockhash],
      'finalized'
    )
    const names = ['Setup', 'Swap', 'Cleanup', 'Transfer']
    let i = 0
    for (const transaction of [
      setupTransaction,
      swapTransaction,
      cleanupTransaction,
      transferTransaction
    ]) {
      if (transaction) {
        if (!transaction.recentBlockhash) {
          transaction.recentBlockhash = latestBlockhashResult.blockhash
        }
        if (!transaction.feePayer) {
          transaction.feePayer = rootAccount
        }
        const fee = yield* call(
          [transaction, transaction.getEstimatedFee],
          connection
        )
        console.debug(`Fee for "${names[i]}" transaction: ${fee} Lamports`)
        transactionFees += fee ?? 5000 // For some reason, swap transactions don't have fee estimates??
      }
      i++
    }
    yield* put(cacheTransactionFees({ transactionFees }))
  }
  return transactionFees
}

/**
 * Calculates all the fees required for executing a swap and transfer by doing a "dry-run"
 * @returns the transaction fees and ATA creation fees (in lamports)
 */
function* getSwapFees({ route }: { route: RouteInfo }) {
  const feesCache = yield* select(getFeesCache)
  const rootAccount = yield* call(getRootSolanaAccount)

  const rootAccountMinBalance = yield* call(getRootAccountRentExemptionMinimum)

  const associatedAccountCreationFees = yield* call(
    getAssociatedAccountCreationFees,
    { rootAccount: rootAccount.publicKey, route, feesCache }
  )

  const transactionFees = yield* call(getTransactionFees, {
    rootAccount: rootAccount.publicKey,
    route,
    feesCache
  })
  console.debug(
    `Estimated transaction fees: ${
      transactionFees / LAMPORTS_PER_SOL
    } SOL. Estimated associated account rent-exemption fees: ${
      associatedAccountCreationFees / LAMPORTS_PER_SOL
    } SOL. Estimated root account rent-exemption fee: ${
      rootAccountMinBalance / LAMPORTS_PER_SOL
    } SOL. Total estimated fees: ${
      (associatedAccountCreationFees +
        transactionFees +
        rootAccountMinBalance) /
      LAMPORTS_PER_SOL
    }`
  )
  return {
    rootAccountMinBalance,
    transactionFees,
    associatedAccountCreationFees,
    totalFees: new BN(rootAccountMinBalance)
      .add(new BN(transactionFees))
      .add(new BN(associatedAccountCreationFees))
  }
}

function* getAudioPurchaseBounds() {
  const DEFAULT_MIN_AUDIO_PURCHASE_AMOUNT = 5
  const DEFAULT_MAX_AUDIO_PURCHASE_AMOUNT = 999
  const remoteConfigInstance = yield* getContext('remoteConfigInstance')
  yield* call([remoteConfigInstance, remoteConfigInstance.waitForRemoteConfig])
  const minAudioAmount =
    remoteConfigInstance.getRemoteVar(IntKeys.MIN_AUDIO_PURCHASE_AMOUNT) ??
    DEFAULT_MIN_AUDIO_PURCHASE_AMOUNT
  const maxAudioAmount =
    remoteConfigInstance.getRemoteVar(IntKeys.MAX_AUDIO_PURCHASE_AMOUNT) ??
    DEFAULT_MAX_AUDIO_PURCHASE_AMOUNT
  return { minAudioAmount, maxAudioAmount }
}

function* getAudioPurchaseInfo({
  payload: { audioAmount }
}: ReturnType<typeof calculateAudioPurchaseInfo>) {
  try {
    // Fail early if audioAmount is too small/large
    const { minAudioAmount, maxAudioAmount } = yield* call(
      getAudioPurchaseBounds
    )
    if (audioAmount > maxAudioAmount) {
      yield* put(
        calculateAudioPurchaseInfoFailed({
          errorType: PurchaseInfoErrorType.MAX_AUDIO_EXCEEDED,
          maxAudio: maxAudioAmount
        })
      )
      return
    } else if (audioAmount < minAudioAmount) {
      yield* put(
        calculateAudioPurchaseInfoFailed({
          errorType: PurchaseInfoErrorType.MIN_AUDIO_EXCEEDED,
          minAudio: minAudioAmount
        })
      )
      return
    }

    // Ensure userbank is created
    yield* fork(function* () {
      yield* call(createUserBankIfNeeded, track, audiusBackendInstance)
    })

    // Setup
    const connection = yield* call(getSolanaConnection)
    const rootAccount = yield* call(getRootSolanaAccount)

    const slippage = SLIPPAGE

    // Get AUDIO => SOL quote
    const reverseQuote = yield* call(JupiterSingleton.getQuote, {
      inputTokenSymbol: 'AUDIO',
      outputTokenSymbol: 'SOL',
      inputAmount: audioAmount,
      slippage
    })
    const slippageFactor = 100.0 / (100.0 - slippage)

    // Adjust quote for potential slippage
    const inSol = Math.ceil(reverseQuote.outputAmount.amount * slippageFactor)

    // Get SOL => AUDIO quote to calculate fees
    const quote = yield* call(JupiterSingleton.getQuote, {
      inputTokenSymbol: 'SOL',
      outputTokenSymbol: 'AUDIO',
      inputAmount: inSol,
      slippage
    })
    const {
      rootAccountMinBalance,
      associatedAccountCreationFees,
      transactionFees
    } = yield* call(getSwapFees, { route: quote.route })

    // Get existing solana balance
    const existingBalance = yield* call(
      [connection, connection.getBalance],
      rootAccount.publicKey,
      'finalized'
    )

    const estimatedLamports = BN.max(
      new BN(inSol)
        .add(new BN(associatedAccountCreationFees))
        .add(new BN(transactionFees))
        .add(new BN(rootAccountMinBalance))
        .sub(new BN(existingBalance)),
      new BN(0)
    )

    // Get SOL => USDC quote to estimate $USD cost
    const quoteUSD = yield* call(JupiterSingleton.getQuote, {
      inputTokenSymbol: 'SOL',
      outputTokenSymbol: 'USDC',
      inputAmount: estimatedLamports.toNumber() / LAMPORTS_PER_SOL,
      slippage: 0
    })

    console.debug(
      `Quoted: ${reverseQuote.outputAmount.uiAmountString} SOL
Adjustment For Slippage (${slippage}%): ${
        (inSol - reverseQuote.outputAmount.amount) / LAMPORTS_PER_SOL
      } SOL
Fees: ${
        (associatedAccountCreationFees +
          rootAccountMinBalance +
          transactionFees) /
        LAMPORTS_PER_SOL
      } SOL
Existing Balance: ${existingBalance / LAMPORTS_PER_SOL} SOL
Total: ${estimatedLamports.toNumber() / LAMPORTS_PER_SOL} SOL ($${
        quoteUSD.outputAmount.uiAmountString
      } USDC)`
    )

    yield* put(
      calculateAudioPurchaseInfoSucceeded({
        estimatedSOL: convertJSBIToAmountObject(
          JSBI.BigInt(estimatedLamports),
          TOKEN_LISTING_MAP.SOL.decimals
        ),
        estimatedUSD: quoteUSD.outputAmount,
        desiredAudioAmount: convertJSBIToAmountObject(
          JSBI.BigInt(
            Math.ceil(audioAmount * 10 ** TOKEN_LISTING_MAP.AUDIO.decimals)
          ),
          TOKEN_LISTING_MAP.AUDIO.decimals
        )
      })
    )
  } catch (e) {
    console.error('Failed to get AUDIO purchase info:', e)
  }
}

function* populateAndSaveTransactionDetails() {
  // Get transaction details from local storage
  const localStorage = yield* getContext('localStorage')
  const localStorageState: BuyAudioLocalStorageState =
    (yield* call(
      [localStorage, localStorage.getJSONValue],
      BUY_AUDIO_LOCAL_STORAGE_KEY
    )) ?? defaultBuyAudioLocalStorageState
  const {
    purchaseTransactionId,
    setupTransactionId,
    swapTransactionId,
    cleanupTransactionId,
    transferTransactionId,
    estimatedUSD,
    purchasedLamports,
    purchasedAudioWei
  } = localStorageState.transactionDetailsArgs

  if (!transferTransactionId) {
    throw new Error('Missing transactionDetailsArgs[transferTransactionId]')
  }

  const postAUDIOBalanceWei: StringWei = yield* select(
    walletSelectors.getAccountTotalBalance
  )
  const postAUDIOBalance = formatWei(
    new BN(postAUDIOBalanceWei) as BNWei
  ).replaceAll(',', '')
  const purchasedAUDIO = purchasedAudioWei
    ? formatWei(new BN(purchasedAudioWei)).replaceAll(',', '')
    : ''
  const divisor = new BN(LAMPORTS_PER_SOL)
  const purchasedLamportsBN = purchasedLamports
    ? new BN(purchasedLamports)
    : new BN('0')
  const purchasedSOL = purchasedLamports
    ? `${purchasedLamportsBN.div(divisor)}.${purchasedLamportsBN
        .mod(divisor)
        .toString()
        .padStart(divisor.toString().length - 1, '0')}`
    : ''

  const transactionMetadata = {
    discriminator: TransactionMetadataType.PURCHASE_SOL_AUDIO_SWAP,
    purchaseTransactionId: purchaseTransactionId ?? '',
    setupTransactionId,
    swapTransactionId: swapTransactionId ?? '',
    cleanupTransactionId,
    usd: estimatedUSD ?? '',
    sol: purchasedSOL,
    audio: purchasedAUDIO
  }
  const transactionDetails: TransactionDetails = {
    date: dayjs().format('MM/DD/YYYY'),
    signature: transferTransactionId,
    transactionType: TransactionType.PURCHASE,
    method:
      PROVIDER_METHOD_MAP[localStorageState.provider ?? OnRampProvider.UNKNOWN],
    balance: postAUDIOBalance,
    change: purchasedAUDIO,
    metadata: transactionMetadata
  }

  yield* put(
    fetchTransactionDetailsSucceeded({
      transactionId: transferTransactionId,
      transactionDetails
    })
  )
  yield* call(saveUserBankTransactionMetadata, transactionMetadata)

  // Clear local storage
  yield* call(
    [localStorage, localStorage.setJSONValue],
    BUY_AUDIO_LOCAL_STORAGE_KEY,
    {}
  )
}

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
 * @returns the new SOL balance for the rootAccount after the purchase succeeds
 */
function* purchaseStep({
  estimatedSOL,
  connection,
  rootAccount,
  provider,
  retryDelayMs,
  maxRetryCount
}: PurchaseStepParams) {
  // Cache current SOL balance
  const initialBalance = yield* call(
    [connection, connection.getBalance],
    rootAccount.publicKey,
    'finalized'
  )

  // Wait for on ramp finish
  const result = yield* race({
    success: take(onRampSucceeded),
    canceled: take(onRampCanceled)
  })

  // If the user didn't complete the on ramp flow, return early
  if (result.canceled) {
    yield* put(make(Name.BUY_AUDIO_ON_RAMP_CANCELED, { provider }))
    return
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
  const signatures = yield* call(
    [connection, connection.getSignaturesForAddress],
    rootAccount.publicKey,
    {
      limit: 1
    }
  )
  const purchaseTransactionId = signatures[0].signature

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

  const localStorage = yield* getContext('localStorage')
  const localStorageState: BuyAudioLocalStorageState =
    (yield* call(
      [localStorage, localStorage.getJSONValue],
      BUY_AUDIO_LOCAL_STORAGE_KEY
    )) ?? defaultBuyAudioLocalStorageState
  localStorageState.transactionDetailsArgs.purchaseTransactionId =
    purchaseTransactionId
  localStorageState.transactionDetailsArgs.purchasedLamports =
    purchasedLamports.toString()
  yield* call(
    [localStorage, localStorage.setJSONValue],
    BUY_AUDIO_LOCAL_STORAGE_KEY,
    localStorageState
  )
  return { purchasedLamports, purchaseTransactionId, newBalance }
}

type SwapStepParams = {
  exchangeAmount: BN
  desiredAudioAmount?: AmountObject
  rootAccount: Keypair
  transactionHandler: TransactionHandler
  retryDelayMs?: number
  maxRetryCount?: number
}
/**
 * Executes the Jupiter exchange from SOL to $AUDIO
 *
 * @throws if cannot confirm the swap
 * @returns the $AUDIO amount resulting from the swap
 */
function* swapStep({
  exchangeAmount,
  desiredAudioAmount,
  rootAccount,
  transactionHandler,
  retryDelayMs,
  maxRetryCount
}: SwapStepParams) {
  // Get quote adjusted for fees
  const quote = yield* call(JupiterSingleton.getQuote, {
    inputTokenSymbol: 'SOL',
    outputTokenSymbol: 'AUDIO',
    inputAmount: exchangeAmount.toNumber() / LAMPORTS_PER_SOL,
    slippage: SLIPPAGE
  })

  // Check that we get the desired AUDIO from the quote
  const audioAdjusted = convertJSBIToAmountObject(
    JSBI.BigInt(
      Math.floor(
        (JSBI.toNumber(quote.route.outAmount) * (100 - SLIPPAGE)) / 100.0
      )
    ),
    TOKEN_LISTING_MAP.AUDIO.decimals
  )
  if (
    desiredAudioAmount &&
    new BN(desiredAudioAmount.amountString).gt(
      new BN(audioAdjusted.amountString)
    )
  ) {
    console.warn(
      `Warning: Purchase AUDIO amount may be lower than expected. Actual min: ${audioAdjusted.uiAmountString} AUDIO. Expected min: ${desiredAudioAmount.uiAmountString} AUDIO`
    )
  }

  // Cache the AUDIO balance before swapping
  const tokenAccount = yield* call(getAudioAccount, {
    rootAccount: rootAccount.publicKey
  })
  const beforeSwapAudioAccountInfo = yield* call(getAudioAccountInfo, {
    tokenAccount
  })
  const beforeSwapAudioBalance = beforeSwapAudioAccountInfo?.amount ?? new BN(0)

  // Swap the SOL for AUDIO
  yield* put(swapStarted())
  const { transactions } = yield* call(JupiterSingleton.exchange, {
    routeInfo: quote.route,
    userPublicKey: rootAccount.publicKey
  })
  const { setupTransactionId, swapTransactionId, cleanupTransactionId } =
    yield* call(JupiterSingleton.executeExchange, {
      ...transactions,
      feePayer: rootAccount.publicKey,
      transactionHandler
    })

  // Write transaction details to local storage
  const localStorage = yield* getContext('localStorage')
  const localStorageState: BuyAudioLocalStorageState =
    (yield* call(
      [localStorage, localStorage.getJSONValue],
      BUY_AUDIO_LOCAL_STORAGE_KEY
    )) ?? defaultBuyAudioLocalStorageState
  localStorageState.transactionDetailsArgs.setupTransactionId =
    setupTransactionId ?? undefined
  localStorageState.transactionDetailsArgs.swapTransactionId =
    swapTransactionId ?? undefined
  localStorageState.transactionDetailsArgs.cleanupTransactionId =
    cleanupTransactionId ?? undefined
  yield* call(
    [localStorage, localStorage.setJSONValue],
    BUY_AUDIO_LOCAL_STORAGE_KEY,
    localStorageState
  )

  yield* put(swapCompleted())

  // Reset associated token account cache now that the swap created the accounts
  // (can't simply set all the accounts in the route to "exists" because wSOL gets closed)
  yield* put(clearFeesCache())

  // Wait for AUDIO funds to come through
  const audioSwappedSpl = yield* call(pollForAudioBalanceChange, {
    tokenAccount,
    initialBalance: beforeSwapAudioBalance,
    retryDelayMs,
    maxRetryCount
  })
  return {
    setupTransactionId,
    swapTransactionId,
    cleanupTransactionId,
    audioSwappedSpl
  }
}

type TransferStepParams = {
  rootAccount: Keypair
  transferAmount: BN
  transactionHandler: TransactionHandler
  provider: OnRampProvider
}
function* transferStep({
  rootAccount,
  transferAmount,
  transactionHandler,
  provider
}: TransferStepParams) {
  yield* put(transferStarted())

  const userBank = yield* call(deriveUserBank, audiusBackendInstance)
  const transferTransaction = yield* call(createTransferToUserBankTransaction, {
    userBank,
    fromAccount: rootAccount.publicKey,
    amount: transferAmount,
    memo: MEMO_MESSAGES[provider]
  })

  console.debug(`Starting transfer transaction...`)
  const { res: transferTransactionId, error: transferError } = yield* call(
    [transactionHandler, transactionHandler.handleTransaction],
    {
      instructions: transferTransaction.instructions,
      feePayerOverride: rootAccount.publicKey,
      skipPreflight: true
    }
  )
  if (transferError) {
    console.debug(`Transfer transaction stringified: ${transferTransaction}`)
    throw new Error(`Transfer transaction failed: ${transferError}`)
  }
  const audioTransferredWei = convertWAudioToWei(transferAmount)

  // Write transaction details to local storage
  const localStorage = yield* getContext('localStorage')
  const localStorageState: BuyAudioLocalStorageState =
    (yield* call(
      [localStorage, localStorage.getJSONValue],
      BUY_AUDIO_LOCAL_STORAGE_KEY
    )) ?? defaultBuyAudioLocalStorageState
  localStorageState.transactionDetailsArgs.transferTransactionId =
    transferTransactionId ?? undefined
  localStorageState.transactionDetailsArgs.purchasedAudioWei =
    audioTransferredWei.toString()
  yield* call(
    [localStorage, localStorage.setJSONValue],
    BUY_AUDIO_LOCAL_STORAGE_KEY,
    localStorageState
  )

  // Update wallet balance optimistically
  yield* put(
    increaseBalance({
      amount: weiToString(audioTransferredWei)
    })
  )
  yield* put(transferCompleted())

  return { audioTransferredWei, transferTransactionId }
}

/**
 * Exchanges all but the minimum balance required for a swap from a wallet once a balance change is seen
 */
function* doBuyAudio({
  payload: { desiredAudioAmount, estimatedSOL, estimatedUSD }
}: ReturnType<typeof onRampOpened>) {
  const provider = yield* select(getBuyAudioProvider)
  if (provider === undefined) {
    console.error('BuyAudio flow started without a provider - aborting...')
    return
  }
  try {
    // Record start
    yield* put(
      make(Name.BUY_AUDIO_ON_RAMP_OPENED, {
        provider
      })
    )

    // Initialize local storage
    const localStorage = yield* getContext('localStorage')
    const initialState: BuyAudioLocalStorageState = {
      ...defaultBuyAudioLocalStorageState,
      transactionDetailsArgs: {
        ...defaultBuyAudioLocalStorageState.transactionDetailsArgs,
        estimatedUSD: estimatedUSD.uiAmountString
      },
      provider,
      desiredAudioAmount
    }
    yield* call(
      [localStorage, localStorage.setJSONValue],
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
      skipPreflight: true
    })

    // Get config
    const remoteConfigInstance = yield* getContext('remoteConfigInstance')
    yield* call(remoteConfigInstance.waitForRemoteConfig)
    const retryDelayMs =
      remoteConfigInstance.getRemoteVar(
        IntKeys.BUY_AUDIO_WALLET_POLL_DELAY_MS
      ) ?? undefined
    const maxRetryCount =
      remoteConfigInstance.getRemoteVar(
        IntKeys.BUY_AUDIO_WALLET_POLL_MAX_RETRIES
      ) ?? undefined

    // Ensure userbank is created
    yield* fork(function* () {
      yield* call(createUserBankIfNeeded, track, audiusBackendInstance)
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

    // Get dummy quote to calculate fees and get exchange amount
    const quote = yield* call(JupiterSingleton.getQuote, {
      inputTokenSymbol: 'SOL',
      outputTokenSymbol: 'AUDIO',
      inputAmount: newBalance / LAMPORTS_PER_SOL,
      slippage: SLIPPAGE
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
              audioSwappedSpl.sub(new BN(desiredAudioAmount.amount))
            )
          ).replaceAll(',', '')
        )
      })
    )
  } catch (e) {
    const stage = yield* select(getBuyAudioFlowStage)
    console.error('BuyAudio failed at stage', stage, 'with error:', e)
    yield* put(buyAudioFlowFailed())
    yield* put(
      make(Name.BUY_AUDIO_FAILURE, {
        provider,
        stage,
        requestedAudio: desiredAudioAmount.uiAmount,
        error: (e as Error).message
      })
    )
  }
}

function* watchCalculateAudioPurchaseInfo() {
  yield takeLatest(calculateAudioPurchaseInfo, getAudioPurchaseInfo)
}

function* watchOnRampOpened() {
  yield takeLatest(onRampOpened, doBuyAudio)
}

/**
 * There are three main steps that could have failed:
 * 1) The purchase went through, but the Jupiter swap failed, leaving some SOL in the root account
 * 2) The purchase and swap went through, but the final transfer failed, leaving some $AUDIO in the root account
 * 3) The purchase, swap, and final transfer all went through, but writing transaction details metadata failed
 *
 * This function checks for the above conditions sequentially, and pops the modal as necessary.
 */
function* recoverPurchaseIfNecessary(openBuyAudioModalOnSuccess?: boolean) {
  let didNeedRecovery = false
  try {
    // Setup
    const rootAccount: Keypair = yield* call(getRootSolanaAccount)
    const connection = yield* call(getSolanaConnection)
    const transactionHandler = new TransactionHandler({
      connection,
      useRelay: false,
      feePayerKeypairs: [rootAccount],
      skipPreflight: true
    })

    // Restore local storage state, lightly sanitizing
    const localStorage = yield* getContext('localStorage')
    const savedLocalStorageState: BuyAudioLocalStorageState =
      (yield* call(
        [localStorage, localStorage.getJSONValue],
        BUY_AUDIO_LOCAL_STORAGE_KEY
      )) ?? {}
    const localStorageState: BuyAudioLocalStorageState = {
      ...defaultBuyAudioLocalStorageState,
      ...savedLocalStorageState,
      transactionDetailsArgs: {
        ...defaultBuyAudioLocalStorageState,
        ...savedLocalStorageState.transactionDetailsArgs
      }
    }
    yield* call(
      [localStorage, localStorage.setJSONValue],
      BUY_AUDIO_LOCAL_STORAGE_KEY,
      localStorageState
    )

    // Get config
    const remoteConfigInstance = yield* getContext('remoteConfigInstance')
    yield* call(remoteConfigInstance.waitForRemoteConfig)
    const retryDelayMs =
      remoteConfigInstance.getRemoteVar(
        IntKeys.BUY_AUDIO_WALLET_POLL_DELAY_MS
      ) ?? undefined
    const maxRetryCount =
      remoteConfigInstance.getRemoteVar(
        IntKeys.BUY_AUDIO_WALLET_POLL_MAX_RETRIES
      ) ?? undefined

    // Get existing SOL balance
    const existingBalance = yield* call(
      [connection, connection.getBalance],
      rootAccount.publicKey,
      'finalized'
    )

    // Get dummy quote and calculate fees
    const quote = yield* call(JupiterSingleton.getQuote, {
      inputTokenSymbol: 'SOL',
      outputTokenSymbol: 'AUDIO',
      inputAmount: existingBalance / LAMPORTS_PER_SOL,
      slippage: SLIPPAGE
    })
    const { totalFees } = yield* call(getSwapFees, { route: quote.route })

    // Check if we have an exchangable amount of SOL, and if so, exchange it to AUDIO
    const exchangableBalance = new BN(existingBalance).sub(totalFees)
    if (exchangableBalance.gt(new BN(0))) {
      console.debug(
        `Found existing SOL balance of ${
          existingBalance / LAMPORTS_PER_SOL
        } SOL, converting ${
          exchangableBalance.toNumber() / LAMPORTS_PER_SOL
        } SOL to AUDIO...`
      )

      yield* put(setVisibility({ modal: 'BuyAudioRecovery', visible: true }))
      yield* put(setVisibility({ modal: 'BuyAudio', visible: false }))
      didNeedRecovery = true

      const { audioSwappedSpl } = yield* swapStep({
        exchangeAmount: exchangableBalance,
        desiredAudioAmount: localStorageState.desiredAudioAmount,
        rootAccount,
        transactionHandler,
        maxRetryCount,
        retryDelayMs
      })
      yield* transferStep({
        transferAmount: audioSwappedSpl,
        rootAccount,
        transactionHandler,
        provider: localStorageState.provider ?? OnRampProvider.UNKNOWN
      })
      yield* call(populateAndSaveTransactionDetails)
    } else {
      // Check for $AUDIO in the account and transfer if necessary
      const tokenAccount = yield* call(getAudioAccount, {
        rootAccount: rootAccount.publicKey
      })
      const audioAccountInfo = yield* call(getAudioAccountInfo, {
        tokenAccount
      })
      const audioBalance = audioAccountInfo?.amount ?? new BN(0)
      if (audioBalance.gt(new BN(0))) {
        console.debug(
          `Found existing $AUDIO balance of ${audioBalance}, transferring to user bank...`
        )

        yield* put(setVisibility({ modal: 'BuyAudioRecovery', visible: true }))
        yield* put(setVisibility({ modal: 'BuyAudio', visible: false }))
        didNeedRecovery = true

        yield* transferStep({
          transferAmount: audioBalance,
          rootAccount,
          transactionHandler,
          provider: localStorageState.provider ?? OnRampProvider.UNKNOWN
        })
        yield* call(populateAndSaveTransactionDetails)
      } else {
        // If we only failed to save the metadata, try that again
        if (localStorageState?.transactionDetailsArgs?.transferTransactionId) {
          const metadata = yield* call(
            getUserBankTransactionMetadata,
            localStorageState.transactionDetailsArgs.transferTransactionId
          )
          if (!metadata) {
            yield* call(populateAndSaveTransactionDetails)
          }
        }
      }
    }
    yield* put(setVisibility({ modal: 'BuyAudioRecovery', visible: false }))
    if (openBuyAudioModalOnSuccess && didNeedRecovery) {
      // If we don't reset state here, this shows the success screen :)
      yield* put(setVisibility({ modal: 'BuyAudio', visible: true }))
    }
  } catch (e) {
    const stage = yield* select(getBuyAudioFlowStage)
    console.error('BuyAudioRecovery failed at stage', stage, 'with error:', e)
    // For now, hide modal on error.
    // TODO: add UI for failures later
    yield* put(setVisibility({ modal: 'BuyAudioRecovery', visible: false }))
  }
}

function* doStartBuyAudioFlow(action: ReturnType<typeof startBuyAudioFlow>) {
  yield* put(setVisibility({ modal: 'BuyAudio', visible: true }))
  yield* call(recoverPurchaseIfNecessary, true)
}

function* watchStartBuyAudioFlow() {
  yield takeLatest(startBuyAudioFlow, doStartBuyAudioFlow)
}

function* watchRecovery() {
  yield* call(recoverPurchaseIfNecessary)
}

export default function sagas() {
  return [
    watchOnRampOpened,
    watchCalculateAudioPurchaseInfo,
    watchStartBuyAudioFlow,
    watchRecovery
  ]
}
