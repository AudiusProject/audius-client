import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Status } from '../../../models/Status'

import { BuyAudioStage, PurchaseInfoErrorType } from './types'

type AmountObject = {
  amount: number
  uiAmount: number
  uiAmountString: string
}

type PurchaseInfo = {
  isError: false
  estimatedSOL: AmountObject
  estimatedUSD: AmountObject
  desiredAudioAmount: AmountObject
}

type PurchaseInfoMaxAudioExceededError = {
  errorType: PurchaseInfoErrorType.MAX_AUDIO_EXCEEDED
  maxAudio: number
}
type PurchaseInfoMinAudioExceededError = {
  errorType: PurchaseInfoErrorType.MIN_AUDIO_EXCEEDED
  minAudio: number
}
type PurchaseInfoUnknownError = {
  errorType: PurchaseInfoErrorType.UNKNOWN
}
type PurchaseInfoError =
  | PurchaseInfoMaxAudioExceededError
  | PurchaseInfoMinAudioExceededError
  | PurchaseInfoUnknownError

type CalculateAudioPurchaseInfoPayload = { audioAmount: number }
type CalculateAudioPurchaseInfoSucceededPayload = Omit<PurchaseInfo, 'isError'>
type CalculateAudioPurchaseInfoFailedPayload = PurchaseInfoError
type BuyAudioState = {
  stage: BuyAudioStage
  error?: boolean
  purchaseInfoStatus: Status
  purchaseInfo?: PurchaseInfo | (PurchaseInfoError & { isError: true })
  feesCache: {
    associatedTokenAccountCache: Record<string, boolean>
    transactionFees: number
  }
}

const initialState: BuyAudioState = {
  stage: BuyAudioStage.START,
  feesCache: {
    associatedTokenAccountCache: {},
    transactionFees: 0
  },
  purchaseInfoStatus: Status.IDLE
}

const slice = createSlice({
  name: 'ui/buy-audio',
  initialState,
  reducers: {
    calculateAudioPurchaseInfo: (
      state,
      _action: PayloadAction<CalculateAudioPurchaseInfoPayload>
    ) => {
      state.purchaseInfoStatus = Status.LOADING
    },
    calculateAudioPurchaseInfoSucceeded: (
      state,
      action: PayloadAction<CalculateAudioPurchaseInfoSucceededPayload>
    ) => {
      state.purchaseInfo = { isError: false, ...action.payload }
      state.purchaseInfoStatus = Status.SUCCESS
    },
    calculateAudioPurchaseInfoFailed: (
      state,
      action: PayloadAction<CalculateAudioPurchaseInfoFailedPayload>
    ) => {
      state.purchaseInfo = {
        isError: true,
        ...action.payload
      }
      state.purchaseInfoStatus = Status.ERROR
    },
    cacheAssociatedTokenAccount: (
      state,
      {
        payload: { account, exists }
      }: PayloadAction<{ account: string; exists: boolean }>
    ) => {
      state.feesCache.associatedTokenAccountCache[account] = exists
    },
    cacheTransactionFees: (
      state,
      {
        payload: { transactionFees }
      }: PayloadAction<{ transactionFees: number }>
    ) => {
      state.feesCache.transactionFees = transactionFees
    },
    clearFeesCache: (state) => {
      state.feesCache = initialState.feesCache
    },
    restart: (state) => {
      state.stage = BuyAudioStage.START
      state.error = undefined
    },
    onRampOpened: (state, _action: PayloadAction<PurchaseInfo>) => {
      state.stage = BuyAudioStage.PURCHASING
    },
    onRampCanceled: (state) => {
      state.error = true
    },
    onRampSucceeded: (state) => {
      state.stage = BuyAudioStage.CONFIRMING_PURCHASE
    },
    swapStarted: (state) => {
      state.stage = BuyAudioStage.SWAPPING
    },
    swapCompleted: (state) => {
      state.stage = BuyAudioStage.CONFIRMING_SWAP
    },
    transferStarted: (state) => {
      state.stage = BuyAudioStage.TRANSFERRING
    },
    transferCompleted: (state) => {
      state.stage = BuyAudioStage.FINISH
    },
    buyAudioFlowFailed: (state) => {
      state.error = true
    }
  }
})

export const {
  calculateAudioPurchaseInfo,
  calculateAudioPurchaseInfoSucceeded,
  calculateAudioPurchaseInfoFailed,
  cacheAssociatedTokenAccount,
  cacheTransactionFees,
  clearFeesCache,
  restart,
  onRampOpened,
  onRampSucceeded,
  onRampCanceled,
  swapStarted,
  swapCompleted,
  transferStarted,
  transferCompleted
} = slice.actions

export default slice.reducer
export const actions = slice.actions
