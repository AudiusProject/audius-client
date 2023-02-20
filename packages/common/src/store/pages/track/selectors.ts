import { CommonState } from 'store/commonStore'
import { PREFIX } from 'store/pages/track/lineup/actions'
import {
  getTrack as getCachedTrack,
  getTrackStatus
} from 'store/tracks/tracksSelectors'
import { getUser as getCachedUser } from 'store/users/usersSelectors'

import { ID, Track, User } from '../../../models'
import { Nullable } from '../../../utils/typeUtils'

export const getBaseState = (state: CommonState) => state.pages.track

export const getTrackId = (state: CommonState) => getBaseState(state).trackId
export const getTrackPermalink = (state: CommonState) =>
  getBaseState(state).trackPermalink

export const getTrack = (state: CommonState, params?: { id?: ID }) => {
  if (params?.id) {
    return getCachedTrack(state, { id: params.id }) ?? null
  }

  const id = getTrackId(state)
  if (id) {
    return getCachedTrack(state, { id }) ?? null
  }
  const permalink = getTrackPermalink(state)
  return getCachedTrack(state, { permalink }) ?? null
}

export const getRemixParentTrack = (
  state: CommonState
): Nullable<Track & { user: User }> => {
  const cachedTrack = getTrack(state)
  const parentTrackId = cachedTrack?.remix_of?.tracks?.[0].parent_track_id
  if (parentTrackId) {
    const parentTrack = getCachedTrack(state, { id: parentTrackId })
    // Get user for deactivated status
    const parentTrackUser = getCachedUser(state, { id: parentTrack?.owner_id })
    if (parentTrack && parentTrackUser) {
      return { ...parentTrack, user: parentTrackUser }
    }
  }
  return null
}

export const getUser = (state: CommonState, params?: { id?: ID }) => {
  const trackId = params?.id ?? getTrack(state)?.owner_id
  if (!trackId) return null
  return getCachedUser(state, { id: trackId })
}
export const getStatus = (state: CommonState) =>
  getTrackStatus(state, { id: getTrackId(state) as ID })

export const getLineup = (state: CommonState) => getBaseState(state).tracks
export const getTrackRank = (state: CommonState) => getBaseState(state).rank
export const getTrendingTrackRanks = (state: CommonState) => {
  const ranks = getBaseState(state).trendingTrackRanks
  if (!ranks.week && !ranks.month && !ranks.year) return null
  return ranks
}
export const getSourceSelector = (state: CommonState) =>
  `${PREFIX}:${getTrackId(state)}`
