import {
  audioTransactionsPageActions,
  TransactionDetails,
  TransactionMethod,
  TransactionType,
  formatDate,
  StringAudio,
  transactionDetailsActions
} from '@audius/common'
import { AudiusLibs, full } from '@audius/sdk'
import { call, takeLatest, put } from 'typed-redux-saga'

import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { audiusSdk } from 'services/audius-sdk/audiusSdk'

const {
  fetchAudioTransactions,
  fetchAudioTransactionMetadata,
  fetchAudioTransactionsCount,
  setAudioTransactions,
  setAudioTransactionsCount
} = audioTransactionsPageActions
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions

const { transactions } = audiusSdk.full

const transactionTypeMap: Record<string, TransactionType> = {
  purchase_stripe: TransactionType.PURCHASE,
  purchase_coinbase: TransactionType.PURCHASE,
  purchase_unknown: TransactionType.PURCHASE,
  'purchase unknown': TransactionType.PURCHASE,
  tip: TransactionType.TIP,
  user_reward: TransactionType.CHALLENGE_REWARD,
  trending_reward: TransactionType.TRENDING_REWARD,
  transfer: TransactionType.TRANSFER
}

const sendReceiveMethods: Record<
  string,
  TransactionMethod.SEND | TransactionMethod.RECEIVE
> = {
  send: TransactionMethod.SEND,
  receive: TransactionMethod.RECEIVE
}

const challengeMethods: Record<string, TransactionMethod.RECEIVE> = {
  receive: TransactionMethod.RECEIVE
}

const purchaseMethods: Record<
  string,
  | TransactionMethod.STRIPE
  | TransactionMethod.COINBASE
  | TransactionMethod.RECEIVE
> = {
  purchase_stripe: TransactionMethod.STRIPE,
  purchase_coinbase: TransactionMethod.COINBASE,
  purchase_unknown: TransactionMethod.RECEIVE,
  'purchase unknown': TransactionMethod.RECEIVE
}

const parseTransaction = (tx: full.TransactionDetails): TransactionDetails => {
  const txType = transactionTypeMap[tx.transaction_type]
  switch (txType) {
    case TransactionType.CHALLENGE_REWARD:
    case TransactionType.TRENDING_REWARD:
      return {
        signature: tx.signature,
        transactionType: txType,
        method: challengeMethods[tx.method],
        date: formatDate(tx.transaction_date),
        change: tx.change as StringAudio,
        balance: tx.balance as StringAudio,
        metadata: tx.metadata as unknown as string
      }
    case TransactionType.PURCHASE:
      return {
        signature: tx.signature,
        transactionType: txType,
        method: purchaseMethods[tx.transaction_type],
        date: formatDate(tx.transaction_date),
        change: tx.change as StringAudio,
        balance: tx.balance as StringAudio,
        metadata: undefined
      }
    case TransactionType.TIP:
    case TransactionType.TRANSFER:
      return {
        signature: tx.signature,
        transactionType: txType,
        method: sendReceiveMethods[tx.method],
        date: formatDate(tx.transaction_date),
        change: tx.change as StringAudio,
        balance: tx.balance as StringAudio,
        metadata: tx.metadata as unknown as string
      }
    default:
      throw new Error('Unknown Transaction')
  }
}

function* signAuthData() {
  const libs: AudiusLibs = yield* call(audiusBackendInstance.getAudiusLibs)
  const unixTs = Math.round(new Date().getTime() / 1000) // current unix timestamp (sec)
  const data = `Click sign to authenticate with discovery node: ${unixTs}`
  const signature = yield* call([libs!.Account!.web3Manager, 'sign'], data)
  return [data, signature]
}

function* fetchAudioTransactionsAsync() {
  yield* takeLatest(
    fetchAudioTransactions.type,
    function* (action: ReturnType<typeof fetchAudioTransactions>): any {
      yield* call(waitForLibsInit)
      const [data, signature] = yield* call(signAuthData)
      const response = yield* call(
        [transactions, transactions.getAudioTransactionHistory],
        {
          encodedDataMessage: data!,
          encodedDataSignature: signature!,
          ...action.payload
        }
      )
      if (!response) {
        return
      }
      const txDetails = response.map((tx) => parseTransaction(tx))
      const { offset } = action.payload
      yield put(setAudioTransactions({ txDetails, offset }))
    }
  )
}

function* fetchTransactionMetadata() {
  yield* takeLatest(
    fetchAudioTransactionMetadata.type,
    function* (action: ReturnType<typeof fetchAudioTransactionMetadata>) {
      const { txDetails } = action.payload
      const response = yield* call(
        [
          audiusBackendInstance,
          audiusBackendInstance.getTransactionDetailsMetadata
        ],
        txDetails.signature
      )
      yield put(
        fetchTransactionDetailsSucceeded({
          transactionId: txDetails.signature,
          transactionDetails: {
            ...txDetails,
            metadata: (response as any[])[0].metadata
          }
        })
      )
    }
  )
}

function* fetchTransactionsCount() {
  yield* takeLatest(fetchAudioTransactionsCount.type, function* () {
    const [data, signature] = yield* call(signAuthData)
    const response = yield* call(
      [transactions, transactions.getAudioTransactionHistoryCount],
      {
        encodedDataMessage: data!,
        encodedDataSignature: signature!
      }
    )
    if (!response) {
      return
    }
    yield put(
      setAudioTransactionsCount({
        count: response as number
      })
    )
  })
}

const sagas = () => {
  const sagas = [
    fetchAudioTransactionsAsync,
    fetchTransactionMetadata,
    fetchTransactionsCount
  ]
  return sagas
}

export default sagas
