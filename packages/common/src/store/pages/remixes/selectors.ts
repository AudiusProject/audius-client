import { Track } from 'models/Track'
import { CommonState } from 'store/commonStore'
import { getTrack as getCachedTrack } from 'store/tracks/tracksSelectors'
import { getUserFromTrack } from 'store/users/combinedUsersSelectors'
import { Nullable } from 'utils/typeUtils'

export const getBaseState = (state: CommonState) => state.pages.remixes

export const getLineup = (state: CommonState) => getBaseState(state).tracks

export const getTrackId = (state: CommonState) =>
  getBaseState(state).page.trackId

export const getCount = (state: CommonState) => getBaseState(state).page.count

export const getTrack = (state: CommonState): Nullable<Track> => {
  const id = getTrackId(state)
  return getCachedTrack(state, { id })
}

export const getUser = (state: CommonState) => {
  const id = getTrackId(state)
  return getUserFromTrack(state, { id })
}
