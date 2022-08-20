import { cacheTracksSelectors } from '@audius/common'
const {  getTrack as getCachedTrack  } = cacheTracksSelectors
import { cacheUsersSelectors } from '@audius/common'
const {  getUserFromTrack  } = cacheUsersSelectors

import { AppState } from 'store/types'

const getBaseState = (state: AppState) =>
  state.application.ui.remixSettingsModal
const getTrackId = (state: AppState) => getBaseState(state).trackId

export const getStatus = (state: AppState) => getBaseState(state).status

export const getTrack = (state: AppState) => {
  const id = getTrackId(state)
  if (!id) return null
  return getCachedTrack(state, { id })
}

export const getUser = (state: AppState) => {
  const id = getTrackId(state)
  if (!id) return null
  return getUserFromTrack(state, { id })
}
