import { CommonState } from 'common/store'
import { getTrack as getCachedTrack } from 'common/store/cache/tracks/selectors'
import { getUserFromTrack } from 'common/store/cache/users/selectors'

export const getBaseState = (state: CommonState) => state.pages.remixes

export const getLineup = (state: CommonState) => getBaseState(state).tracks

export const getTrackId = (state: CommonState) =>
  getBaseState(state).page.trackId

export const getCount = (state: CommonState) => getBaseState(state).page.count

export const getTrack = (state: CommonState) => {
  const id = getTrackId(state)
  return getCachedTrack(state, { id })
}

export const getUser = (state: CommonState) => {
  const id = getTrackId(state)
  return getUserFromTrack(state, { id })
}
