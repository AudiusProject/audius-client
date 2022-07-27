import { AppState } from 'store/types'

export const getBuyAudioFlow = (state: AppState) => state.ui.buyAudio.flow

export const getQuotes = (state: AppState) => state.ui.buyAudio.swaps
