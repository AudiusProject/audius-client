import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import BN from 'bn.js'
import { AppState } from 'store/types'
import { formatWeiToAudioString, parseWeiNumber } from 'utils/formatUtil'
import { Brand, Nullable } from 'utils/typeUtils'

export type StringWei = Brand<string, 'stringWEI'>
export type StringAudio = Brand<string, 'stringAudio'>
export type BNWei = Brand<BN, 'BNWei'>
export type BNAudio = Brand<BN, 'BNAudio'>

export type WalletAddress = string

type WalletState = {
  balance: Nullable<StringWei>
  pendingClaimBalance: Nullable<StringWei>
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
      { payload: { balance } }: PayloadAction<{ balance: StringWei }>
    ) => {
      state.balance = balance
    },
    increaseBalance: (
      state,
      { payload: { amount } }: PayloadAction<{ amount: StringWei }>
    ) => {
      if (!state.balance) return
      const existingBalance = new BN(state.balance)
      state.balance = existingBalance
        .add(new BN(amount))
        .toString() as StringWei
    },
    decreaseBalance: (
      state,
      { payload: { amount } }: PayloadAction<{ amount: StringWei }>
    ) => {
      if (!state.balance) return
      const existingBalance = new BN(state.balance)
      state.balance = existingBalance
        .sub(new BN(amount))
        .toString() as StringWei
    },
    setClaim: (
      state,
      { payload: { balance } }: PayloadAction<{ balance: StringWei }>
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
      action: PayloadAction<{ recipientWallet: string; amount: StringWei }>
    ) => {}
  }
})

// Conversion Fns

export const weiToAudioString = (bnWei: BNWei): StringAudio => {
  const stringAudio = formatWeiToAudioString(bnWei) as StringAudio
  return stringAudio
}

export const weiToAudio = (bnWei: BNWei): BNAudio => {
  const stringAudio = formatWeiToAudioString(bnWei) as StringAudio
  return stringAudioToBN(stringAudio)
}

export const audioToWei = (stringAudio: StringAudio): BNWei => {
  const wei = parseWeiNumber(stringAudio) as BNWei
  return wei
}

export const stringWeiToBN = (stringWei: StringWei): BNWei => {
  return new BN(stringWei) as BNWei
}

export const stringAudioToBN = (stringAudio: StringAudio): BNAudio => {
  return new BN(stringAudio) as BNAudio
}

export const stringWeiToAudioBN = (stringWei: StringWei): BNAudio => {
  const bnWei = stringWeiToBN(stringWei)
  const stringAudio = weiToAudioString(bnWei)
  return new BN(stringAudio) as BNAudio
}

export const weiToString = (wei: BNWei): StringWei => {
  return wei.toString() as StringWei
}

// Selectors

export const getClaimableBalance = (state: AppState): Nullable<BNWei> => {
  const claimable = state.wallet.pendingClaimBalance
  if (!claimable) return null
  return stringWeiToBN(claimable)
}

export const getAccountBalance = (state: AppState): Nullable<BNWei> => {
  const balance = state.wallet.balance
  if (!balance) return null
  return stringWeiToBN(balance)
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
