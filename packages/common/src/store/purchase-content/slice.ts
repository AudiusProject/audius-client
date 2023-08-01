import { Action, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ID } from 'models/Identifiers'

import { ContentType, PurchaseContentStage } from './types'

type OnSuccess = {
  action?: Action
  message?: string
}

type PurchaseContentState = {
  stage: PurchaseContentStage
  contentType: ContentType
  contentId: ID
  error?: Error
  onSuccess?: OnSuccess
}

const initialState: PurchaseContentState = {
  contentType: ContentType.TRACK,
  contentId: -1,
  error: undefined,
  stage: PurchaseContentStage.START
}

const slice = createSlice({
  name: 'purchase-content',
  initialState,
  reducers: {
    startPurchaseContentFlow: (
      state,
      action: PayloadAction<{
        contentId: ID
        onSuccess?: OnSuccess
      }>
    ) => {
      state.stage = PurchaseContentStage.START
      state.error = undefined
      state.contentId = action.payload.contentId
      state.onSuccess = action.payload.onSuccess
    },
    onBuyUSDC: (state) => {
      state.stage = PurchaseContentStage.BUY_USDC
    },
    onBuyUSDCSucceeded: (state) => {
      state.stage = PurchaseContentStage.TRANSFER_USDC
    },
    onTransferSucceeded: (state) => {
      state.stage = PurchaseContentStage.CONFIRMING_PURCHASE
    },
    onConfirmingPurchaseSucceeded: (state) => {
      state.stage = PurchaseContentStage.FINISH
    },

    purchaseContentFlowFailed: (state) => {
      // TODO: Probably want to pass error in action payload
      state.error = new Error('Purchase failed')
    }
  }
})

export const {
  startPurchaseContentFlow,
  onBuyUSDC,
  onBuyUSDCSucceeded,
  onTransferSucceeded,
  onConfirmingPurchaseSucceeded,
  purchaseContentFlowFailed
} = slice.actions

export default slice.reducer
export const actions = slice.actions
