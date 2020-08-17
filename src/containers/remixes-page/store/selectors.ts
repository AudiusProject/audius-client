import { AppState } from 'store/types'
import { getTrack as getCachedTrack } from 'store/cache/tracks/selectors'
import { getUserFromTrack } from 'store/cache/users/selectors'

export const getBaseState = (state: AppState) => state.application.pages.remixes

export const getLineup = (state: AppState) => getBaseState(state).tracks

export const getTrackId = (state: AppState) => getBaseState(state).page.trackId

export const getCount = (state: AppState) => getBaseState(state).page.count

export const getTrack = (state: AppState) => {
  const id = getTrackId(state)
  return getCachedTrack(state, { id })
}

export const getUser = (state: AppState) => {
  const id = getTrackId(state)
  return getUserFromTrack(state, { id })
}
