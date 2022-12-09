import {
  audioTransactionsPageActions,
  TransactionDetails,
  TransactionMethod,
  TransactionType,
  formatDate,
  transactionDetailsActions
} from '@audius/common'
import { AudiusLibs, full } from '@audius/sdk'
import BN from 'bn.js'
import { call, takeLatest, put } from 'typed-redux-saga'

import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { audiusSdk } from 'services/audius-sdk/audiusSdk'
const {
  fetchAudioTransactions,
  appendAudioTransactions,
  fetchAudioTransactionMetadata,
  fetchAudioTransactionsCount,
  setAudioTransactionsCount
} = audioTransactionsPageActions
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions

const AUDIO_DIVIDER = new BN('100000000')
const { transactions } = audiusSdk.full
const {
  GetAudioTransactionHistorySortMethodEnum,
  GetAudioTransactionHistorySortDirectionEnum
} = full

const transactionTypeMap: Record<string, TransactionType> = {
  purchase_stripe: TransactionType.PURCHASE,
  tip: TransactionType.TIP,
  user_reward: TransactionType.CHALLENGE_REWARD,
  trending_reward: TransactionType.TRENDING_REWARD,
  transfer: TransactionType.TRANSFER
}

const transactionMethodMap: Record<string, TransactionMethod> = {
  purchase_coinbase: TransactionMethod.COINBASE,
  purchase_stripe: TransactionMethod.STRIPE,
  send: TransactionMethod.SEND,
  receive: TransactionMethod.RECEIVE
}

const purchaseTransactionTypes: Set<string> = new Set([
  'purchase_coinbase',
  'purchase_stripe'
])

const splAudioToIntString = (amount: string): string => {
  const bnAudio = new BN(amount)
  const audioOut = bnAudio.div(AUDIO_DIVIDER)
  return audioOut.toString()
}

const parseChange = (method: string, amountBN: string) => {
  const negative = method === 'send'
  const amountInt = splAudioToIntString(amountBN)
  return negative ? '-' + amountInt : amountInt
}

const parseTransaction = (tx: any): TransactionDetails => {
  const tx_detail: TransactionDetails = {
    signature: tx.signature as string,
    transactionType: transactionTypeMap[tx.transaction_type],
    method: purchaseTransactionTypes.has(tx.transaction_type)
      ? transactionMethodMap[tx.transaction_type]
      : transactionMethodMap[tx.method],
    date: formatDate(tx.transaction_date),
    change: parseChange(tx.method, tx.change),
    balance: splAudioToIntString(tx.balance),
    metadata: tx.metadata
  }
  return tx_detail
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
      console.log('REED in saga action: ', action)
      yield* call(waitForLibsInit)
      const [data, signature] = yield* call(signAuthData)
      // transactions.getAudioTransactionHistory({
      //   encodedDataMessage: data,
      //   encodedDataSignature: signature!,
      //   ...action.payload
      // })
      const response = yield* call(
        [transactions, transactions.getAudioTransactionHistory],
        {
          encodedDataMessage: data,
          encodedDataSignature: signature!,
          ...action.payload
        }
      )
      if (!response) {
        return
      }
      const tx_details: TransactionDetails[] = (response as any[]).map((tx) =>
        parseTransaction(tx)
      )
      console.log('REED data in saga: ', tx_details)
      yield put(appendAudioTransactions(tx_details))
    }
  )
}

function* fetchTransactionMetadata() {
  yield* takeLatest(
    fetchAudioTransactionMetadata.type,
    function* (action: ReturnType<typeof fetchAudioTransactionMetadata>) {
      const { tx_details } = action.payload
      const response = yield* call(
        [
          audiusBackendInstance,
          audiusBackendInstance.getTransactionDetailsMetadata
        ],
        tx_details.signature
      )
      console.log('REED fetchTransactionMetadata: ', response)
      yield put(
        fetchTransactionDetailsSucceeded({
          transactionId: tx_details.signature,
          transactionDetails: { ...tx_details, metadata: response[0].metadata }
        })
      )
    }
  )
}

function* fetchTransactionsCount() {
  yield* takeLatest(fetchAudioTransactionsCount.type, function* () {
    const [data, signature] = yield* call(signAuthData)
    // transactions.getAudioTransactionHistoryCount({
    //   encodedDataMessage: data!,
    //   encodedDataSignature: signature!
    // })
    console.log('REED inside fetchTransaction: ', data, signature)
    const response = yield* call(
      [transactions, transactions.getAudioTransactionHistoryCount],
      {
        encodedDataMessage: data!,
        encodedDataSignature: signature!
      }
    )
    console.log('REED in fetch count saga: ', response)
    if (!response) {
      return
    }
    yield put(
      setAudioTransactionsCount({
        count: response as number
        // count: 113
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
