import { TrackMetadata, remixesPageActions, Track } from '@audius/common'
import { takeEvery, call, put } from 'redux-saga/effects'

import { waitForBackendSetup } from 'common/store/backend/sagas'
import {
  retrieveTrackByHandleAndSlug,
  retrieveTracks
} from 'common/store/cache/tracks/utils/retrieveTracks'

import tracksSagas from './lineups/tracks/sagas'

const { fetchTrack, fetchTrackSucceeded } = remixesPageActions

function* watchFetch() {
  yield takeEvery(
    fetchTrack.type,
    function* (action: ReturnType<typeof fetchTrack>) {
      yield call(waitForBackendSetup)
      const { handle, slug, id } = action.payload
      if (!id && (!handle || !slug)) {
        throw new Error(
          'Programming error - fetch tracks action for remixes page requires either `id` or both `handle` and `slug` params in the payload.'
        )
      }
      let track: TrackMetadata | Track
      if (id) {
        const res: Track[] = yield call(retrieveTracks, { trackIds: [id] })
        track = res[0]
      } else {
        if (!handle || !slug) return // This line not needed, but is here to appease typescript
        track = yield call(retrieveTrackByHandleAndSlug, {
          handle,
          slug
        })
      }

      yield put(fetchTrackSucceeded({ trackId: track.track_id }))
    }
  )
}

export default function sagas() {
  return [...tracksSagas(), watchFetch]
}
