import { AppState } from 'store/types'

export const getBuyAudioFlow = (state: AppState) => state.ui.buyAudio.flow

export const getQuoteStatuses = (state: AppState) =>
  state.ui.buyAudio.quoteStatuses

export const getExchangeStatus = (state: AppState) =>
  state.ui.buyAudio.exchangeStatus
