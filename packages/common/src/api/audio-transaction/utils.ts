import { full } from '@audius/sdk'

import { StringAudio } from 'models/Wallet'
import {
  TransactionDetails,
  TransactionMethod,
  TransactionType
} from 'store/ui/transaction-details/types'
import { formatDate } from 'utils/timeUtil'

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

export const parseTransaction = (
  tx: full.TransactionDetails
): TransactionDetails => {
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
