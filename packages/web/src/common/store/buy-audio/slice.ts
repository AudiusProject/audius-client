import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import Status from 'common/models/Status'

export enum Flow {
  COINBASE_PAY = 'COINBASE_PAY'
}

export enum QuoteStatus {
  IDLE = 'IDLE',
  QUOTING = 'QUOTING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

export enum ExchangeStatus {
  IDLE = 'IDLE',
  WAITING = 'WAITING',
  EXCHANGING = 'EXCHANGING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

export enum Stage {
  START = 'START',
  PURCHASING = 'PURCHASING',
  CONFIRMING_PURCHASE = 'CONFIRMING_PURCHASE',
  SWAPPING = 'SWAPPING',
  CONFIRMING_SWAP = 'CONFIRMING_SWAP',
  TRANSFERRING = 'TRANSFERRING',
  FINISH = 'FINISH'
}

type AmountObject = {
  amount: number
  uiAmount: number
  uiAmountString: string
}

type PurchaseInfo = {
  estimatedSOL: AmountObject
  estimatedUSD: AmountObject
  desiredAudioAmount: AmountObject
}
type CalculateAudioPurchaseInfoPayload = { audioAmount: number }
type CalculateAudioPurchaseInfoSucceededPayload = PurchaseInfo

type BuyAudioState = {
  flow: Flow
  stage: Stage
  purchaseInfoStatus: Status
  purchaseInfo?: PurchaseInfo
  feesCache: {
    associatedTokenAccountCache: Record<string, boolean>
    transactionFees: number
  }
}

const initialState: BuyAudioState = {
  flow: Flow.COINBASE_PAY,
  stage: Stage.START,
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
      action: PayloadAction<CalculateAudioPurchaseInfoPayload>
    ) => {
      state.purchaseInfoStatus = Status.LOADING
    },
    calculateAudioPurchaseInfoSucceeded: (
      state,
      action: PayloadAction<CalculateAudioPurchaseInfoSucceededPayload>
    ) => {
      state.purchaseInfo = action.payload
      state.purchaseInfoStatus = Status.SUCCESS
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
      state.stage = Stage.START
    },
    onRampOpened: (state, _action: PayloadAction<PurchaseInfo>) => {
      state.stage = Stage.PURCHASING
    },
    onRampCanceled: (state) => {
      state.stage = Stage.START
    },
    onRampSucceeded: (state) => {
      state.stage = Stage.CONFIRMING_PURCHASE
    },
    swapStarted: (state) => {
      state.stage = Stage.SWAPPING
    },
    swapCompleted: (state) => {
      state.stage = Stage.CONFIRMING_SWAP
    },
    transferStarted: (state) => {
      state.stage = Stage.TRANSFERRING
    },
    transferCompleted: (state) => {
      state.stage = Stage.FINISH
    }
  }
})

export const {
  calculateAudioPurchaseInfo,
  calculateAudioPurchaseInfoSucceeded,
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
