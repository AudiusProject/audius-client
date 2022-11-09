import { TrackMetadata, remixSettingsActions, getContext } from '@audius/common'
import { takeLatest, call, put } from 'typed-redux-saga'

import { parseTrackRoute } from 'utils/route/trackRouteParser'

import {
  retrieveTrackByHandleAndSlug,
  retrieveTracks
} from '../cache/tracks/utils/retrieveTracks'

const { fetchTrack, fetchTrackSucceeded, fetchTrackFailed } =
  remixSettingsActions

const getHandleAndSlug = (
  url: string,
  publicHostname: string,
  isNativeMobile: boolean
) => {
  // Get just the pathname part from the url
  try {
    const { pathname, hostname } = new URL(url)
    // Decode the extracted pathname so we don't end up
    // double encoding it later on
    const decodedPathname = decodeURIComponent(pathname)
    if (
      trackUrl.hostname !== process.env.REACT_APP_PUBLIC_HOSTNAME &&
      trackUrl.hostname !== window.location.hostname
    ) {
      return null
    }
    return parseTrackRoute()
  } catch (err) {
    return null
  }
}

function* watchFetchTrack() {
  yield* takeLatest(
    fetchTrack.type,
    function* (action: ReturnType<typeof fetchTrack>) {
      const { url } = action.payload
      const { PUBLIC_HOSTAME } = yield* getContext('env')
      const isNativeMobile = yield* getContext('isNativeMobile')
      const params = getHandleAndSlug(url, PUBLIC_HOSTAME, isNativeMobile)
      console.log('params', params)
      if (params) {
        const { handle, slug, trackId } = params
        let track: TrackMetadata | null = null
        if (handle && slug) {
          track = yield* call(retrieveTrackByHandleAndSlug, {
            handle,
            slug
          })
        } else if (trackId) {
          track = yield* call(retrieveTracks, { trackIds: [trackId] })
        }
        if (track) {
          yield* put(fetchTrackSucceeded({ trackId: track.track_id }))
          return
        }
      }
      yield* put(fetchTrackFailed())
    }
  )
}

export default function sagas() {
  return [watchFetchTrack]
}
