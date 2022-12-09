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
  transactions: Partial<TransactionDetails[]>
}

const initialState: TransactionsUIState = {
  transactionsCount: 0,
  transactions: []
}

const slice = createSlice({
  name: 'audio-transactions-page',
  initialState,
  reducers: {
    fetchAudioTransactionsCount: () => {
      console.log('REED in fetchAudioTransactionsCount')
    },
    setAudioTransactionsCount: (
      state,
      action: PayloadAction<{ count: number }>
    ) => {
      state.transactionsCount = action.payload.count
    },
    fetchAudioTransactions: (
      _state,
      action: PayloadAction<FetchAudioTransactionsPayload>
    ) => {
      console.log('REED in audio transactions action', action)
    },
    fetchAudioTransactionMetadata: (
      _state,
      action: PayloadAction<{ tx_details: TransactionDetails }>
    ) => {
      console.log('REED in fetchAudioTransactionMetadata', action)
    },
    setAudioTransactions: (
      state,
      action: PayloadAction<TransactionDetails[]>
    ) => {
      state.transactions = action.payload
      console.log('REED resetting transactions')
    },
    appendAudioTransactions: (
      state,
      action: PayloadAction<TransactionDetails[]>
    ) => {
      state.transactions = [...state.transactions, ...action.payload]
      console.log('REED appended', state.transactions)
    }
  }
})

export const {
  fetchAudioTransactions,
  setAudioTransactions,
  fetchAudioTransactionMetadata,
  fetchAudioTransactionsCount,
  setAudioTransactionsCount,
  appendAudioTransactions
} = slice.actions

export default slice

export const actions = slice.actions
