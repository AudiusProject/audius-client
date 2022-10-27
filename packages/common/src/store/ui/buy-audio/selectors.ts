import { CommonState } from 'store/reducers'

export const getBuyAudioProvider = (state: CommonState) =>
  state.ui.buyAudio.provider

export const getBuyAudioFlowStage = (state: CommonState) =>
  state.ui.buyAudio.stage

export const getBuyAudioFlowError = (state: CommonState) =>
  state.ui.buyAudio.error

export const getAudioPurchaseInfo = (state: CommonState) =>
  state.ui.buyAudio.purchaseInfo

export const getAudioPurchaseInfoStatus = (state: CommonState) =>
  state.ui.buyAudio.purchaseInfoStatus

export const getFeesCache = (state: CommonState) => state.ui.buyAudio.feesCache

export const getOnSuccessAction = (state: CommonState) =>
  state.ui.buyAudio.onSuccessAction

export const getStripeSessionStatus = (state: CommonState) =>
  state.ui.buyAudio.stripeSessionStatus
