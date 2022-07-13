import { call, select } from 'typed-redux-saga'

import { getUserId } from 'common/store/account/selectors'
import { getTrack } from 'common/store/cache/tracks/selectors'
import { retrieveUserTracks } from 'common/store/pages/profile/lineups/tracks/retrieveUserTracks'
import { PREFIX, tracksActions } from 'common/store/pages/track/lineup/actions'
import {
  getLineup,
  getSourceSelector as sourceSelector
} from 'common/store/pages/track/selectors'
import { LineupSagas } from 'store/lineup/sagas'
import { waitForValue } from 'utils/sagaHelpers'

function* getTracks({
  payload,
  offset = 0,
  limit = 6
}: {
  payload: {
    ownerHandle: string
    /** Permalink of track that should be loaded first */
    heroTrackPermalink: string
  }
  offset?: number
  limit?: number
}) {
  const { ownerHandle, heroTrackPermalink } = payload
  const currentUserId = yield* select(getUserId)

  const lineup = []
  const heroTrack = yield* call(
    waitForValue,
    getTrack,
    { permalink: heroTrackPermalink },
    // Wait for the track to have a track_id (e.g. remix children could get fetched first)
    (track) => track.track_id
  )
  if (offset === 0) {
    lineup.push(heroTrack)
  }
  const heroTrackRemixParentTrackId =
    heroTrack.remix_of?.tracks?.[0]?.parent_track_id
  if (heroTrackRemixParentTrackId) {
    const remixParentTrack = yield* call(waitForValue, getTrack, {
      id: heroTrackRemixParentTrackId
    })
    if (offset <= 1) {
      lineup.push(remixParentTrack)
    }
  }

  let moreByArtistTracksOffset: number
  if (heroTrackRemixParentTrackId) {
    moreByArtistTracksOffset = offset <= 1 ? 0 : offset - 2
  } else {
    moreByArtistTracksOffset = offset === 0 ? 0 : offset - 1
  }

  const processed = yield* call(retrieveUserTracks, {
    handle: ownerHandle,
    currentUserId,
    sort: 'plays',
    limit: limit + 2,
    // The hero track is always our first track and the remix parent is always the second track (if any):
    offset: moreByArtistTracksOffset
  })

  return lineup
    .concat(
      processed
        // Filter out any track that matches the `excludePermalink` + the remix parent track (if any)
        .filter(
          (t) =>
            t.permalink !== heroTrackPermalink &&
            t.track_id !== heroTrackRemixParentTrackId
        )
    )
    .slice(0, limit)
}

class TracksSagas extends LineupSagas {
  constructor() {
    super(
      PREFIX,
      tracksActions,
      getLineup,
      getTracks,
      undefined,
      undefined,
      sourceSelector
    )
  }
}

export default function sagas() {
  return new TracksSagas().getSagas()
}
