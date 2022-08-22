import { CommonState } from '../../../store/reducers'

export const getBuyAudioFlowStage = (state: CommonState) =>
  state.ui.buyAudio.stage

export const getAudioPurchaseInfo = (state: CommonState) =>
  state.ui.buyAudio.purchaseInfo

export const getAudioPurchaseInfoStatus = (state: AppState) =>
  state.ui.buyAudio.purchaseInfoStatus

export const getFeesCache = (state: CommonState) => state.ui.buyAudio.feesCache
