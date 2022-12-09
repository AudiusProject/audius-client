import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TransactionDetails } from '../../ui/transaction-details/types'

type FetchAudioTransactionsPayload = {
  offset?: number
  limit?: number
  sortMethod?: 'transaction_type' | 'date'
  sortDirection?: 'asc' | 'desc'
}

type TransactionsUIState = {
  transactionsCount: number
  transactions: (TransactionDetails | {})[]
}

const initialState: TransactionsUIState = {
  transactionsCount: 0,
  transactions: []
}

const slice = createSlice({
  name: 'audio-transactions-page',
  initialState,
  reducers: {
    fetchAudioTransactionsCount: () => {},
    setAudioTransactionsCount: (
      state,
      action: PayloadAction<{ count: number }>
    ) => {
      state.transactionsCount = action.payload.count
    },
    fetchAudioTransactions: (
      _state,
      _action: PayloadAction<FetchAudioTransactionsPayload>
    ) => {},
    fetchAudioTransactionMetadata: (
      _state,
      _action: PayloadAction<{ tx_details: TransactionDetails }>
    ) => {},
    setAudioTransactions: (
      state,
      action: PayloadAction<{
        tx_details: (TransactionDetails | {})[]
        offset: number
      }>
    ) => {
      const { tx_details, offset } = action.payload
      const transactionsCopy = state.transactions.slice()
      transactionsCopy.splice(offset, tx_details.length, ...tx_details)

      state.transactions = transactionsCopy
    }
  }
})

export const {
  fetchAudioTransactions,
  setAudioTransactions,
  fetchAudioTransactionMetadata,
  fetchAudioTransactionsCount,
  setAudioTransactionsCount
  // appendAudioTransactions
} = slice.actions

export default slice

export const actions = slice.actions
