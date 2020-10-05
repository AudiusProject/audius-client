import { call, select } from 'redux-saga/effects'

import {
  PREFIX,
  tracksActions
} from 'containers/track-page/store/lineups/tracks/actions'
import {
  getSourceSelector as sourceSelector,
  getLineup
} from 'containers/track-page/store/selectors'
import { LineupSagas } from 'store/lineup/sagas'
import { getTrack } from 'store/cache/tracks/selectors'
import { waitForValue } from 'utils/sagaHelpers'
import { retrieveUserTracks } from 'containers/profile-page/store/lineups/tracks/retrieveUserTracks'
import { getUserId } from 'store/account/selectors'

function* getTracks({ offset, limit, payload }) {
  const { ownerHandle, trackId } = payload
  const currentUserId = yield select(getUserId)
  const processed = yield call(retrieveUserTracks, {
    handle: ownerHandle,
    currentUserId,
    sort: 'plays',
    limit: 6
  })

  // Add the hero track into the lineup so that the queue can pull directly from the lineup
  // TODO: Create better ad-hoc add to queue methods and use that instead of this
  const track = yield call(waitForValue, getTrack, { id: trackId })
  const lineup = [track]

  const remixParentTrackId = track._remix_parents?.[0]?.track_id
  if (remixParentTrackId) {
    const remixParentTrack = yield call(waitForValue, getTrack, {
      id: remixParentTrackId
    })
    lineup.push(remixParentTrack)
  }

  return lineup.concat(
    processed
      // Filter out any track that happens to be the hero track
      // or is the remix parent track.
      .filter(t => t.track_id !== trackId && t.track_id !== remixParentTrackId)
      // Take only the first 5
      .slice(0, 5)
  )
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
