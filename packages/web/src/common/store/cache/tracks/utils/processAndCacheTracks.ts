import {
  Kind,
  Track,
  TrackMetadata,
  makeUid,
  getContext,
  cacheTracksActions
} from '@audius/common'
import { zipObject } from 'lodash'
import { put, call } from 'typed-redux-saga'

import { waitForRead } from 'utils/sagaHelpers'

import { addUsersFromTracks } from './helpers'
import { reformat } from './reformat'

/**
 * Processes tracks, adding users and calling `reformat`, before
 * caching the tracks.
 */
export function* processAndCacheTracks<T extends TrackMetadata>(
  tracks: T[]
): Generator<any, Track[], any> {
  yield* waitForRead()
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  // Add users
  yield* call(addUsersFromTracks, tracks)

  // Remove users, add images
  const reformattedTracks = tracks.map((track) =>
    reformat(track, audiusBackendInstance)
  )

  // insert tracks into cache
  yield* put(
    cacheTracksActions.addTracks({
      tracks: reformattedTracks,
      uids: zipObject(
        reformattedTracks.map((track) => makeUid(Kind.TRACKS, track.track_id)),
        reformattedTracks.map((track) => track.track_id)
      )
    })
  )

  return reformattedTracks
}
