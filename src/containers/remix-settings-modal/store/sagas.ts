import { takeEvery, call, put } from 'redux-saga/effects'

import { fetchTrack, fetchTrackSucceeded, fetchTrackFailed } from './slice'
import {
  retrieveTrackByHandleAndSlug,
  retrieveTracks
} from 'store/cache/tracks/utils/retrieveTracks'
import { parseTrackRoute } from 'utils/route/trackRouteParser'
import { TrackMetadata } from 'models/Track'

const getHandleAndSlug = (url: string) => {
  // Get just the pathname part from the url
  try {
    const trackUrl = new URL(url)
    const pathname = trackUrl.pathname

    if (
      trackUrl.hostname !== process.env.REACT_APP_PUBLIC_HOSTNAME &&
      trackUrl.hostname !== window.location.hostname
    ) {
      return null
    }
    return parseTrackRoute(pathname)
  } catch (err) {
    return null
  }
}

function* watchFetchTrack() {
  yield takeEvery(fetchTrack.type, function* (
    action: ReturnType<typeof fetchTrack>
  ) {
    const { url } = action.payload
    const params = getHandleAndSlug(url)
    if (params) {
      const { handle, slug, trackId } = params
      let track: TrackMetadata | null = null
      if (handle && slug) {
        track = yield call(retrieveTrackByHandleAndSlug, {
          handle,
          slug
        })
      } else if (trackId) {
        track = yield call(retrieveTracks, { trackIds: [trackId] })
      }
      if (track) {
        yield put(fetchTrackSucceeded({ trackId: track.track_id }))
        return
      }
    }
    yield put(fetchTrackFailed())
  })
}

export default function sagas() {
  return [watchFetchTrack]
}
