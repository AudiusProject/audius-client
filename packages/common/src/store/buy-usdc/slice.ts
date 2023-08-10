import { Action, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { BuyUSDCStage, USDCOnRampProvider, PurchaseInfo } from './types'

type StripeSessionStatus =
  | 'initialized'
  | 'rejected'
  | 'requires_payment'
  | 'fulfillment_processing'
  | 'fulfillment_complete'

type OnSuccess = {
  action?: Action
  message?: string
}

type BuyUSDCState = {
  stage: BuyUSDCStage
  error?: Error
  provider: USDCOnRampProvider
  onSuccess?: OnSuccess
  stripeSessionStatus?: StripeSessionStatus
}

const initialState: BuyUSDCState = {
  provider: USDCOnRampProvider.UNKNOWN,
  stage: BuyUSDCStage.START
}

const slice = createSlice({
  name: 'buy-usdc',
  initialState,
  reducers: {
    startBuyUSDCFlow: (
      state,
      action: PayloadAction<{
        purchaseInfo: PurchaseInfo
        provider: USDCOnRampProvider
        onSuccess?: OnSuccess
      }>
    ) => {
      state.stage = BuyUSDCStage.START
      state.error = undefined
      state.provider = action.payload.provider
      state.onSuccess = action.payload.onSuccess
    },
    onRampOpened: (state, _action: PayloadAction<PurchaseInfo>) => {
      state.stage = BuyUSDCStage.PURCHASING
    },
    onRampCanceled: (state) => {
      if (state.stage === BuyUSDCStage.PURCHASING) {
        state.error = new Error('USDC purchase canceled')
        state.stage = BuyUSDCStage.CANCELED
      }
    },
    onRampSucceeded: (state) => {
      state.stage = BuyUSDCStage.CONFIRMING_PURCHASE
    },
    buyUSDCFlowFailed: (state) => {
      // TODO: Probably want to pass error in action payload
      state.error = new Error('USDC purchase failed')
    },
    buyUSDCFlowSucceeded: (state) => {
      state.stage = BuyUSDCStage.FINISH
    },
    stripeSessionStatusChanged: (
      state,
      action: PayloadAction<{ status: StripeSessionStatus }>
    ) => {
      state.stripeSessionStatus = action.payload.status
    }
  }
})

export const {
  buyUSDCFlowFailed,
  buyUSDCFlowSucceeded,
  startBuyUSDCFlow,
  onRampOpened,
  onRampSucceeded,
  onRampCanceled,
  stripeSessionStatusChanged
} = slice.actions

export default slice.reducer
export const actions = slice.actions