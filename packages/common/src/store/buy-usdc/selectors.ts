import { CommonState } from 'store/reducers'

export const getBuyUSDCProvider = (state: CommonState) => state.buyUSDC.provider

export const getBuyUSDCFlowStage = (state: CommonState) => state.buyUSDC.stage

export const getBuyUSDCFlowError = (state: CommonState) => state.buyUSDC.error

export const getAudioPurchaseInfo = (state: CommonState) =>
  state.buyUSDC.purchaseInfo

export const getAudioPurchaseInfoStatus = (state: CommonState) =>
  state.buyUSDC.purchaseInfoStatus

export const getFeesCache = (state: CommonState) => state.buyUSDC.feesCache

export const getOnSuccess = (state: CommonState) => state.buyUSDC.onSuccess

export const getStripeSessionStatus = (state: CommonState) =>
  state.buyUSDC.stripeSessionStatus
