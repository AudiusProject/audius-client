import { ID } from 'models/Identifiers'
import { SquareSizes } from 'models/ImageSizes'

export const EDIT_TRACK = 'CACHE/TRACKS/EDIT_TRACK'
export const EDIT_TRACK_SUCCEEDED = 'CACHE/TRACKS/EDIT_TRACK_SUCCEEDED'
export const EDIT_TRACK_FAILED = 'CACHE/TRACKS/EDIT_TRACK_FAILED'

export const DELETE_TRACK = 'CACHE/TRACKS/DELETE_TRACK'
export const DELETE_TRACK_SUCCEEDED = 'CACHE/TRACKS/DELETE_TRACK_SUCCEEDED'
export const DELETE_TRACK_FAILED = 'CACHE/TRACKS/DELETE_TRACK_FAILED'

export const FETCH_COVER_ART = 'CACHE/TRACKS/FETCH_COVER_ART'

export const CHECK_IS_DOWNLOADABLE = 'CACHE/TRACKS/CHECK_IS_DOWNLOADABLE'

export function editTrack(trackId: ID, formFields: Record<string, unknown>) {
  return { type: EDIT_TRACK, trackId, formFields }
}

export function editTrackSucceeded() {
  return { type: EDIT_TRACK_SUCCEEDED }
}

export function editTrackFailed() {
  return { type: EDIT_TRACK_FAILED }
}

export function deleteTrack(trackId: ID) {
  return { type: DELETE_TRACK, trackId }
}

export function deleteTrackSucceeded(trackId: ID) {
  return { type: DELETE_TRACK_SUCCEEDED, trackId }
}

export function deleteTrackFailed() {
  return { type: DELETE_TRACK_FAILED }
}

export function fetchCoverArt(trackId: ID, size: SquareSizes) {
  return { type: FETCH_COVER_ART, trackId, size }
}

export const checkIsDownloadable = (trackId: ID) => ({
  type: CHECK_IS_DOWNLOADABLE,
  trackId
})
