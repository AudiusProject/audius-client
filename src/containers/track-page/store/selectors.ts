import {
  getTrack as getCachedTrack,
  getStatus as getCachedTrackStatus
} from 'store/cache/tracks/selectors'
import { getUser as getCachedUser } from 'store/cache/users/selectors'
import { AppState } from 'store/types'
import { ID } from 'models/common/Identifiers'
import { PREFIX } from 'containers/track-page/store/lineups/tracks/actions'

export const getBaseState = (state: AppState) => state.track

export const getTrackId = (state: AppState) => getBaseState(state).trackId
export const getTrack = (state: AppState) => {
  const id = getTrackId(state)
  return getCachedTrack(state, { id })
}

export const getRemixParentTrack = (state: AppState) => {
  const id = getTrackId(state)
  const cachedTrack = getCachedTrack(state, { id })
  const parentTrackId = cachedTrack?.remix_of?.tracks?.[0].parent_track_id
  return parentTrackId ? getCachedTrack(state, { id: parentTrackId }) : null
}

export const getUser = (state: AppState) => {
  const track = getTrack(state)
  if (!track) return null
  return getCachedUser(state, { id: track.owner_id })
}
export const getStatus = (state: AppState) =>
  getCachedTrackStatus(state, { id: getTrackId(state) as ID })

export const getLineup = (state: AppState) => getBaseState(state).tracks
export const getTrackRank = (state: AppState) => getBaseState(state).rank
export const getSourceSelector = (state: AppState) =>
  `${PREFIX}:${getTrackId(state)}`
