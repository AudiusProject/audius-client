import { TransactionHandler } from '@audius/sdk/dist/core'
import { Jupiter, SwapMode, RouteInfo } from '@jup-ag/core'
import { AccountInfo, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction
} from '@solana/web3.js'
import BN from 'bn.js'
import JSBI from 'jsbi'
import {
  call,
  select,
  put,
  takeEvery,
  race,
  delay
} from 'typed-redux-saga/macro'

import { BNWei } from 'common/models/Wallet'
import { getAccountUser } from 'common/store/account/selectors'
import { TOKEN_LISTING_MAP } from 'common/store/buy-audio/constants'
import {
  exchange,
  exchangeAfterBalanceChange,
  exchangeFailed,
  exchangeSucceeded,
  quote,
  quoteFailed,
  quoteSucceeded
} from 'common/store/buy-audio/slice'
import { increaseBalance } from 'common/store/wallet/slice'
import { convertJSBIToUiString, weiToString } from 'common/utils/wallet'
import AudiusBackend from 'services/AudiusBackend'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

const BALANCE_CHANGE_TIMEOUT_MS = 120_000 // 2 minutes
const BALANCE_CHANGE_POLL_INTERVAL_MS = 5_000 // 5 second
const WEI_DECIMALS = 18 // 18 decimals on ETH AUDIO
const SPL_DECIMALS = 8 // 8 decimals on SPL AUDIO
const SWAP_MIN_SOL = 0.05 // Minimum SOL balance needed to execute a Jupiter Swap
const ERROR_CODE_SLIPPAGE = 6000 // Error code for when the swap fails due to specified slippage being exceeded
let _jup: Jupiter

const rpcList = [
  'https://solana-api.projectserum.com',
  'https://ssc-dao.genesysgo.net',
  'https://mercuria-fronten-1cd8.mainnet.rpcpool.com'
] // taken from jup.ag main site

function convertWAudioToWei(amount: BN) {
  const decimals = WEI_DECIMALS - SPL_DECIMALS
  return amount.mul(new BN('1'.padEnd(decimals + 1, '0'))) as BNWei
}

/**
 * Initializes Jupiter singleton if necessary and returns
 * @returns {Jupiter} a Jupiter instance
 */
function* initJupiterIfNecessary() {
  if (!_jup) {
    let retries = 0
    // Try all three RPC nodes if some fail to init for whatever reason
    while (retries < rpcList.length) {
      try {
        _jup = yield* call(Jupiter.load, {
          connection: new Connection(rpcList[retries], {
            disableRetryOnRateLimit: true
          }),
          cluster: 'mainnet-beta',
          restrictIntermediateTokens: true,
          wrapUnwrapSOL: true,
          routeCacheDuration: 5_000 // 5 seconds
        })
        if (_jup) {
          break
        }
      } catch (e) {
        console.warn('Jupiter failed to initialize with', rpcList[retries], e)
        retries++
      }
    }
  }
  if (!_jup) {
    throw new Error('Jupiter failed to initialize')
  }
  return _jup
}
/**
 * Gets a quote from Jupiter for an exchange from inputTokenSymbol => outputTokenSymbol
 * @returns the best quote including the RouteInfo
 */
function* doQuote({
  inputTokenSymbol,
  outputTokenSymbol,
  inputAmount,
  forceFetch,
  slippage = 3,
  padForSlippage = false
}: ReturnType<typeof quote>['payload']) {
  const inputToken = TOKEN_LISTING_MAP[inputTokenSymbol]
  const outputToken = TOKEN_LISTING_MAP[outputTokenSymbol]
  const slippageFactor = padForSlippage ? 100.0 / (100.0 - slippage) : 1
  const amount = JSBI.BigInt(
    Math.ceil(inputAmount * slippageFactor * 10 ** inputToken.decimals)
  )
  if (!inputToken || !outputToken) {
    throw new Error(
      `Tokens not found: ${inputTokenSymbol} => ${outputTokenSymbol}`
    )
  }
  const jup = yield* call(initJupiterIfNecessary)
  const routes = yield* call([jup, jup.computeRoutes], {
    inputMint: new PublicKey(inputToken.address),
    outputMint: new PublicKey(outputToken.address),
    amount,
    slippage,
    swapMode: SwapMode.ExactIn,
    forceFetch
  })
  const bestRoute = routes.routesInfos[0]
  const resultQuote = {
    inputUiAmount: convertJSBIToUiString(
      bestRoute.inAmount,
      inputToken.decimals
    ),
    outputUiAmount: convertJSBIToUiString(
      bestRoute.outAmount,
      outputToken.decimals
    ),
    route: bestRoute,
    inputTokenSymbol,
    outputTokenSymbol
  }
  return resultQuote
}

/**
 * Wrapper for TransactionHandler.handleTransaction that does some logging and error checking
 * @param name transaction name, used for logs
 * @param transaction the transaction object
 * @param feePayer the keypair of the feepayer
 * @param transactionHandler the transaction handler
 * @returns the result of the transaction handler handleTransaction call
 */
function* sendTransaction(
  name: string,
  transaction: Transaction,
  feePayer: Keypair,
  transactionHandler: TransactionHandler
) {
  console.debug(`Exchange: starting ${name} transaction...`)
  console.debug(
    `Exchange: ${name} transaction stringified:`,
    JSON.stringify(transaction)
  )
  const result = yield* call(
    [transactionHandler, transactionHandler.handleTransaction],
    {
      instructions: transaction.instructions,
      feePayerOverride: feePayer.publicKey.toString(),
      skipPreflight: true
    }
  )
  if (result.error) {
    if (result.errorCode === ERROR_CODE_SLIPPAGE) {
      throw new Error(`${name} transaction failed: Slippage threshold exceeded`)
    }
    throw new Error(`${name} transaction failed: ${result.error}`)
  }
  console.debug(`Exchange: ${name} transaction... success txid: ${result.res}`)
  return result
}

/**
 * Creates a transaction to transfer all AUDIO from the root associated token account to the user's userbank
 * @returns the transaction and the amount being transferred
 */
function* getTransferTransaction({
  mintAddress,
  fromAccount
}: {
  mintAddress: string
  fromAccount: Keypair
}) {
  const account = yield* select(getAccountUser)
  if (!account || !account.userBank) {
    throw new Error('User does not have a user bank')
  }
  const mintPublicKey = new PublicKey(mintAddress)
  yield* call(waitForLibsInit)
  const associatedTokenAccount = (yield* call(
    [
      window.audiusLibs.solanaWeb3Manager,
      window.audiusLibs.solanaWeb3Manager.findAssociatedTokenAddress
    ],
    fromAccount.publicKey.toString()
  )) as PublicKey
  const tokenAccountInfo = (yield* call(
    [
      window.audiusLibs.solanaWeb3Manager,
      window.audiusLibs.solanaWeb3Manager.getAssociatedTokenAccountInfo
    ],
    associatedTokenAccount.toString()
  )) as AccountInfo
  if (!tokenAccountInfo) {
    throw new Error('No $AUDIO account in root wallet')
  }
  const instruction = Token.createTransferCheckedInstruction(
    TOKEN_PROGRAM_ID,
    associatedTokenAccount,
    mintPublicKey,
    new PublicKey(account.userBank),
    fromAccount.publicKey,
    [],
    tokenAccountInfo.amount,
    8
  )
  const tx = new Transaction()
  tx.add(instruction)
  return { tx, amount: tokenAccountInfo.amount }
}

/**
 * Executes a Jupiter Swap given the RouteInfo, account, and the transactionHandler
 */
function* doSwap({
  route,
  account,
  transactionHandler
}: {
  route: RouteInfo
  account: Keypair
  transactionHandler: TransactionHandler
}) {
  const jup = yield* call(initJupiterIfNecessary)
  const {
    transactions: { setupTransaction, swapTransaction, cleanupTransaction }
  } = yield* call([jup, jup.exchange], {
    routeInfo: route,
    userPublicKey: account.publicKey
  })
  if (setupTransaction) {
    yield* call(
      sendTransaction,
      'Setup',
      setupTransaction,
      account,
      transactionHandler
    )
  }
  yield* call(
    sendTransaction,
    'Swap',
    swapTransaction,
    account,
    transactionHandler
  )
  if (cleanupTransaction) {
    yield* call(
      sendTransaction,
      'Cleanup',
      cleanupTransaction,
      account,
      transactionHandler
    )
  }
}

/**
 * Swaps the input token (eg. SOL) to the output token (AUDIO) and, if necessary,
 * transfers resulting AUDIO into the user's userbank from their root Solana account
 *
 * Currently only supports SOL => AUDIO
 *
 * @returns the amount of AUDIO transferred to the userbank
 */
function* doExchange({
  inputAmount,
  inputTokenSymbol,
  outputTokenSymbol,
  slippage
}: ReturnType<typeof exchange>['payload']) {
  yield* call(waitForLibsInit)
  const connection: Connection = window.audiusLibs.solanaWeb3Manager.connection
  const rootAccount: Keypair = yield* call(AudiusBackend.getRootSolanaAccount)

  // Only supports SOL => AUDIO for now
  if (inputTokenSymbol !== 'SOL' || outputTokenSymbol !== 'AUDIO') {
    throw new Error(
      `Exchange not supported for ${inputTokenSymbol} => ${outputTokenSymbol}`
    )
  }

  // Get a fresh quote - reduces chances of failing due to slippage,
  // but increases chance of different price than originally quoted (outputted $AUDIO can vary more).
  // It's also required since we can't put RouteInfo in redux (it isn't a plain object), so the saga return value is used.
  const exchangeQuote = yield* call(doQuote, {
    inputAmount,
    inputTokenSymbol,
    outputTokenSymbol,
    forceFetch: true,
    slippage
  })
  const transactionHandler = new TransactionHandler({
    connection,
    useRelay: false,
    feePayerKeypairs: [rootAccount],
    skipPreflight: true
  })
  yield* call(doSwap, {
    route: exchangeQuote.route!,
    account: rootAccount,
    transactionHandler
  })
  const { tx: transferTransaction, amount: transferAmount } =
    yield* getTransferTransaction({
      mintAddress: window.audiusLibs.solanaWeb3Config.mintAddress,
      fromAccount: rootAccount
    })
  yield* call(
    sendTransaction,
    'Transfer',
    transferTransaction,
    rootAccount,
    transactionHandler
  )
  return transferAmount
}

/**
 * Polls the given wallet until a balance change is seen
 * @returns the old balance, the new balance, and how many retries it took
 */
function* pollBalance({
  connection,
  walletKey
}: {
  connection: Connection
  walletKey: PublicKey
}) {
  const startingBalance = yield* call(
    [connection, connection.getBalance],
    walletKey
  )
  let balance = startingBalance
  let retries = 0
  while (balance === startingBalance) {
    yield* delay(BALANCE_CHANGE_POLL_INTERVAL_MS)
    console.debug(
      `Exchange: polling balance #${retries++}: ${
        balance / LAMPORTS_PER_SOL
      } SOL === ${startingBalance / LAMPORTS_PER_SOL} SOL`
    )
    balance = yield* call([connection, connection.getBalance], walletKey)
  }
  return {
    oldBalance: startingBalance,
    newBalance: balance,
    retryCount: retries
  }
}

/**
 * Exchanges all but the minimum balance required for a swap from a wallet once a balance change is seen.
 * Warns if the balance isn't sufficient to swap the requested input amount
 */
function* doExchangeAfterBalanceChange({
  payload: { inputTokenSymbol, outputTokenSymbol, inputAmount, slippage }
}: ReturnType<typeof exchangeAfterBalanceChange>) {
  try {
    yield* call(waitForLibsInit)
    const connection: Connection =
      window.audiusLibs.solanaWeb3Manager.connection
    const rootAccount: Keypair = yield* call(AudiusBackend.getRootSolanaAccount)
    const walletKey = rootAccount.publicKey
    const result = yield* race({
      balanceChange: call(pollBalance, {
        connection,
        walletKey
      }),
      timeout: delay(BALANCE_CHANGE_TIMEOUT_MS)
    })
    if (result.timeout || !result.balanceChange) {
      throw new Error(
        `Wallet balance polling timed out after ${
          BALANCE_CHANGE_TIMEOUT_MS / 1000.0
        }s, `
      )
    }
    const { oldBalance, newBalance, retryCount } = result.balanceChange
    console.debug(
      `ExchangeAfterBalanceUpdate: balance changed after ${retryCount} attempts: ${
        oldBalance / LAMPORTS_PER_SOL
      } SOL => ${newBalance / LAMPORTS_PER_SOL}, change of ${
        (newBalance - oldBalance) / LAMPORTS_PER_SOL
      } SOL`
    )
    if (
      inputTokenSymbol === 'SOL' &&
      newBalance / LAMPORTS_PER_SOL < inputAmount + SWAP_MIN_SOL
    ) {
      console.warn(
        `ExchangeAfterBalanceUpdate: balance still insufficient for transaction. Expected: ${
          inputAmount + SWAP_MIN_SOL
        } SOL, Actual: ${newBalance / LAMPORTS_PER_SOL} SOL`
      )
    }
    yield* put(
      exchange({
        inputTokenSymbol,
        outputTokenSymbol,
        padForSlippage: false,
        slippage,
        inputAmount: newBalance - SWAP_MIN_SOL
      })
    )
  } catch (e) {
    console.error('ExchangeAfterBalanceUpdate: Failed with error:', e)
  }
}

function* watchQuote() {
  yield* takeEvery(quote, function* ({ payload }) {
    try {
      const quote = yield* call(doQuote, payload)
      yield* put(quoteSucceeded(quote))
    } catch (e) {
      console.error('Quote: Failed with error:', e)
      yield* put(quoteFailed(payload))
    }
  })
}
function* watchExchange() {
  yield* takeEvery(exchange, function* ({ payload }) {
    try {
      const outputAmount = yield* call(doExchange, payload)
      const amount = weiToString(convertWAudioToWei(outputAmount))
      yield* put(exchangeSucceeded(payload))
      yield* put(
        increaseBalance({
          amount
        })
      )
    } catch (e) {
      console.error('Exchange: Failed with error:', e)
      yield* put(exchangeFailed(payload))
    }
  })
}

function* watchExchangeAfterBalanceChange() {
  yield* takeEvery(exchangeAfterBalanceChange, doExchangeAfterBalanceChange)
}

export default function sagas() {
  return [watchQuote, watchExchange, watchExchangeAfterBalanceChange]
}
