import { Track } from 'models/Track'
import { getTrack as getCachedTrack } from 'store/tracks/tracksSelectors'
import { getUserFromTrack } from 'store/users/combinedUsersSelectors'
import { Nullable } from 'utils/typeUtils'

import { CommonState } from '../commonStore'

const getBaseState = (state: CommonState) => state.ui.remixSettings
const getTrackId = (state: CommonState) => getBaseState(state).trackId

export const getStatus = (state: CommonState) => getBaseState(state).status

export const getTrack = (state: CommonState): Nullable<Track> => {
  const id = getTrackId(state)
  if (!id) return null
  return getCachedTrack(state, { id })
}

export const getUser = (state: CommonState) => {
  const id = getTrackId(state)
  if (!id) return null
  return getUserFromTrack(state, { id })
}
