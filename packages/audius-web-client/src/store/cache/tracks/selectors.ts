import { getEntry, getAllEntries } from 'store/cache/selectors'
import { Kind, AppState, Status } from 'store/types'
import { ID, UID } from 'models/common/Identifiers'
import Track from 'models/Track'

export const getTrack = (
  state: AppState,
  props: { id?: ID | null; uid?: UID | null }
) => {
  return getEntry(state, {
    ...props,
    kind: Kind.TRACKS
  })
}
export const getStatus = (state: AppState, props: { id?: ID | null }) =>
  (props.id && state.tracks.statuses[props.id]) || null

export const getTracks = (
  state: AppState,
  props: { ids?: ID[] | null; uids?: UID[] | null }
) => {
  if (props && props.ids) {
    const tracks: { [id: number]: Track } = {}
    props.ids.forEach(id => {
      const track = getTrack(state, { id })
      if (track) {
        tracks[id] = track
      }
    })
    return tracks
  } else if (props && props.uids) {
    const tracks: { [id: number]: Track } = {}
    props.uids.forEach(uid => {
      const track = getTrack(state, { uid })
      if (track) {
        tracks[track.track_id] = track
      }
    })
    return tracks
  }
  return getAllEntries(state, { kind: Kind.TRACKS })
}

// TODO:
export const getTracksByUid = (state: AppState) => {
  return Object.keys(state.tracks.uids).reduce((entries, uid) => {
    entries[uid] = getTrack(state, { uid })
    return entries
  }, {} as { [uid: string]: Track | null })
}

export const getStatuses = (state: AppState, props: { ids: ID[] }) => {
  const statuses: { [id: number]: Status } = {}
  props.ids.forEach(id => {
    const status = getStatus(state, { id })
    if (status) {
      statuses[id] = status
    }
  })
  return statuses
}
