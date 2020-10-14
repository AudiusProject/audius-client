import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BN from 'bn.js'
import { AppState } from 'store/types'
import { Nullable } from 'utils/typeUtils'

export type StringBN = string
export type WalletAddress = string

type WalletState = {
  balance: Nullable<StringBN>
  pendingClaimBalance: Nullable<StringBN>
}

const initialState: WalletState = {
  balance: null,
  pendingClaimBalance: null
}

const slice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (
      state,
      { payload: { balance } }: PayloadAction<{ balance: StringBN }>
    ) => {
      state.balance = balance
    },
    increaseBalance: (
      state,
      { payload: { amount } }: PayloadAction<{ amount: StringBN }>
    ) => {
      if (!state.balance) return
      const existingBalance = new BN(state.balance)
      state.balance = existingBalance.add(new BN(amount)).toString()
    },
    decreaseBalance: (
      state,
      { payload: { amount } }: PayloadAction<{ amount: StringBN }>
    ) => {
      if (!state.balance) return
      const existingBalance = new BN(state.balance)
      state.balance = existingBalance.sub(new BN(amount)).toString()
    },
    setClaim: (
      state,
      { payload: { balance } }: PayloadAction<{ balance: StringBN }>
    ) => {
      state.pendingClaimBalance = balance
    },

    // Saga Actions

    getClaim: () => {},
    getBalance: () => {},
    claim: () => {},
    claimSucceeded: () => {},
    claimFailed: (state, action: PayloadAction<{ error?: string }>) => {},
    send: (
      state,
      action: PayloadAction<{ recipientWallet: string; amount: string }>
    ) => {}
  }
})

export const getClaimableBalance = (state: AppState) => {
  const claimable = state.wallet.pendingClaimBalance
  if (!claimable) return null
  return new BN(claimable)
}

export const getAccountBalance = (state: AppState) => {
  const balance = state.wallet.balance
  if (!balance) return null
  return new BN(balance)
}

export const {
  setBalance,
  increaseBalance,
  decreaseBalance,
  setClaim,
  getClaim,
  getBalance,
  claim,
  claimSucceeded,
  claimFailed,
  send
} = slice.actions
export default slice.reducer
