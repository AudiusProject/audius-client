import { createSelector } from '@reduxjs/toolkit'

import { AppState } from 'store/types'

const shareSoundToTikTokModalState = (state: AppState) =>
  state.application.ui.shareSoundToTikTokModal

export const getIsOpen = createSelector(
  shareSoundToTikTokModalState,
  state => state.isOpen
)
export const getTrackId = createSelector(
  shareSoundToTikTokModalState,
  state => state.trackId
)
export const getTrackCid = createSelector(
  shareSoundToTikTokModalState,
  state => state.trackCid
)
export const getTrackTitle = createSelector(
  shareSoundToTikTokModalState,
  state => state.trackTitle
)
export const getIsAuthenticated = createSelector(
  shareSoundToTikTokModalState,
  state => state.isAuthenticated
)
