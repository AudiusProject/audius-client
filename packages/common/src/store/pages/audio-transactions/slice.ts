import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { TransactionDetails } from '../../ui/transaction-details/types'

type TransactionsUIState = {}

const initialState: TransactionsUIState = {}

const slice = createSlice({
  name: 'audio-transactions-page',
  initialState,
  reducers: {
    fetchAudioTransactionMetadata: (
      _state,
      _action: PayloadAction<{ txDetails: TransactionDetails }>
    ) => {}
  }
})

export const { fetchAudioTransactionMetadata } = slice.actions

export default slice

export const actions = slice.actions
