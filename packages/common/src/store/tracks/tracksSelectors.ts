import { mapValues, zipObject } from 'lodash'

import { ID, UID } from 'models/Identifiers'
import { Track } from 'models/Track'
import { CommonState } from 'store/commonStore'
import { Nullable } from 'utils/typeUtils'

import { tracksAdapter } from './tracksSlice'

export const {
  selectById: selectTracksById,
  selectIds: selectTracksIds,
  selectEntities: selectTracksEntities,
  selectAll: selectAllTracks,
  selectTotal: selectTotalTracks
} = tracksAdapter.getSelectors<CommonState>((state) => state.tracks)

export const getTrack = (
  state: CommonState,
  props?: { id?: ID | null; uid?: UID | null; permalink?: string | null }
): Nullable<Track> => {
  if (props?.permalink) {
    const trackId = state.tracks.permalinks[props.permalink.toLowerCase()]
    if (trackId) {
      return selectTracksById(state, trackId) ?? null
    }
  }
  if (props?.id) {
    return selectTracksById(state, props.id) ?? null
  }

  if (props?.uid) {
    const trackId = state.tracks.uids[props.uid]
    if (trackId) {
      return selectTracksById(state, trackId) ?? null
    }
  }

  return null
}

export const getTracks = (
  state: CommonState,
  props?: {
    ids?: ID[] | null
    uids?: UID[] | null
    permalinks?: string[] | null
  }
) => {
  if (props?.ids) {
    const tracks: { [id: number]: Track } = {}
    for (const id of props.ids) {
      const track = getTrack(state, { id })
      if (track) {
        tracks[id] = track
      }
    }
    return tracks
  }
  if (props?.permalinks) {
    const tracks: { [handle: string]: Track } = {}
    for (const permalink of props.permalinks) {
      const track = getTrack(state, { permalink })
      if (track) {
        tracks[permalink] = track
      }
    }
    return tracks
  }

  return selectTracksEntities(state) ?? {}
}

export const getTrackTimestamps = (state: CommonState, ids: ID[]) => {
  return zipObject(
    ids,
    ids.map((id) => state.tracks.timestamps[id] ?? null)
  )
}

// We should simply just get tracks based on lineup-id
export const getTracksByUid = (state: CommonState) => {
  return mapValues(state.tracks.uids, (id) => getTrack(state, { id }))
}

export const getTrackStatus = (state: CommonState, { id }: { id: ID }) =>
  state.tracks.statuses[id]

export const getTrackStatuses = (
  state: CommonState,
  { ids }: { ids: ID[] }
) => {
  return zipObject(
    ids,
    ids.map((id) => state.tracks.statuses[id])
  )
}
