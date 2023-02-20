import { getUserFromTrack } from 'store/users/combinedUsersSelectors'

import { getTrack as getCachedTrack } from '../cache/tracks/selectors'
import { CommonState } from '../commonStore'

const getBaseState = (state: CommonState) => state.ui.remixSettings
const getTrackId = (state: CommonState) => getBaseState(state).trackId

export const getStatus = (state: CommonState) => getBaseState(state).status

export const getTrack = (state: CommonState) => {
  const id = getTrackId(state)
  if (!id) return null
  return getCachedTrack(state, { id })
}

export const getUser = (state: CommonState) => {
  const id = getTrackId(state)
  if (!id) return null
  return getUserFromTrack(state, { id })
}
