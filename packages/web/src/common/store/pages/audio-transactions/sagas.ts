import {
  audioTransactionsPageActions,
  TransactionDetails,
  TransactionMethod,
  TransactionType,
  formatDate,
  StringAudio,
  transactionDetailsActions,
  getContext,
  Nullable
} from '@audius/common'
import type { InAppAudioPurchaseMetadata } from '@audius/common'
import { AudiusLibs, full } from '@audius/sdk'
import { call, takeLatest, put } from 'typed-redux-saga'

import { fetchUsers } from 'common/store/cache/users/sagas'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'

const {
  fetchAudioTransactions,
  fetchAudioTransactionMetadata,
  fetchAudioTransactionsCount,
  setAudioTransactions,
  setAudioTransactionsCount
} = audioTransactionsPageActions
const { fetchTransactionDetailsSucceeded } = transactionDetailsActions

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
  const txType = transactionTypeMap[tx.transactionType]
  switch (txType) {
    case TransactionType.CHALLENGE_REWARD:
    case TransactionType.TRENDING_REWARD:
      return {
        signature: tx.signature,
        transactionType: txType,
        method: challengeMethods[tx.method],
        date: formatDate(tx.transactionDate),
        change: tx.change as StringAudio,
        balance: tx.balance as StringAudio,
        metadata: tx.metadata as unknown as string
      }
    case TransactionType.PURCHASE:
      return {
        signature: tx.signature,
        transactionType: txType,
        method: purchaseMethods[tx.transactionType],
        date: formatDate(tx.transactionDate),
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
        date: formatDate(tx.transactionDate),
        change: tx.change as StringAudio,
        balance: tx.balance as StringAudio,
        metadata: tx.metadata as unknown as string
      }
    default:
      throw new Error('Unknown Transaction')
  }
}

function* fetchAudioTransactionsAsync() {
  yield* takeLatest(
    fetchAudioTransactions.type,
    function* (action: ReturnType<typeof fetchAudioTransactions>): any {
      const { data, signature } = yield* call([
        audiusBackendInstance,
        audiusBackendInstance.signDiscoveryNodeRequest
      ])
      const audiusSdk = yield* getContext('audiusSdk')
      const sdk = yield* call(audiusSdk)
      const response = yield* call(
        [
          sdk.full.transactions,
          sdk.full.transactions.getAudioTransactionHistory
        ],
        {
          encodedDataMessage: data,
          encodedDataSignature: signature,
          ...action.payload
        }
      )
      if (!response) {
        return
      }
      const txDetails: TransactionDetails[] =
        response.data?.map((tx) => parseTransaction(tx)) ?? []
      const { offset } = action.payload
      yield put(setAudioTransactions({ txDetails, offset }))
      const userIds = txDetails
        .map((tx) => {
          if (tx.transactionType === TransactionType.TIP) {
            return tx.metadata
          }
          return null
        })
        .filter((tx) => tx !== null)
      yield* call(
        fetchUsers,
        userIds,
        undefined, // requiredFields
        false // forceRetrieveFromSource
      )
    }
  )
}

function* fetchTransactionMetadata() {
  yield* takeLatest(
    fetchAudioTransactionMetadata.type,
    function* (action: ReturnType<typeof fetchAudioTransactionMetadata>) {
      const { txDetails } = action.payload
      if (txDetails.transactionType !== TransactionType.PURCHASE) {
        return
      }
      yield* call(waitForLibsInit)
      const libs: AudiusLibs = yield* call(audiusBackendInstance.getAudiusLibs)
      const response = yield* call(
        [
          libs.identityService!,
          libs.identityService!.getUserBankTransactionMetadata
        ],
        txDetails.signature
      )
      yield put(
        fetchTransactionDetailsSucceeded({
          transactionId: txDetails.signature,
          transactionDetails: {
            ...txDetails,
            metadata: response as Nullable<InAppAudioPurchaseMetadata>
          }
        })
      )
    }
  )
}

function* fetchTransactionsCount() {
  yield* takeLatest(fetchAudioTransactionsCount.type, function* () {
    const { data, signature } = yield* call([
      audiusBackendInstance,
      audiusBackendInstance.signDiscoveryNodeRequest
    ])
    const audiusSdk = yield* getContext('audiusSdk')
    const sdk = yield* call(audiusSdk)
    const response = yield* call(
      [
        sdk.full.transactions,
        sdk.full.transactions.getAudioTransactionHistoryCount
      ],
      {
        encodedDataMessage: data,
        encodedDataSignature: signature
      }
    )
    if (!response) {
      return
    }
    yield put(
      setAudioTransactionsCount({
        count: response.data ?? 0
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
