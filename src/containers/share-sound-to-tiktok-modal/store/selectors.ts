import { AppState } from 'store/types'

const getBaseState = (state: AppState) =>
  state.application.ui.shareSoundToTikTokModal

export const getIsOpen = (state: AppState) => getBaseState(state).isOpen
export const getTrackId = (state: AppState) => getBaseState(state).trackId
export const getTrackTitle = (state: AppState) => getBaseState(state).trackTitle
