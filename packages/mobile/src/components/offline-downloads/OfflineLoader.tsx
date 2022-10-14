import type { Track } from '@audius/common'
import { cacheActions, Kind, makeUid } from '@audius/common'
import { useDispatch } from 'react-redux'
import { useAsync } from 'react-use'

import {
  getTrackJson,
  listTracks,
  verifyTrack
} from 'app/services/offline-downloader'
import { loadTrack } from 'app/store/offline-downloads/slice'

export const OfflineLoader = () => {
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  const dispatch = useDispatch()

  useAsync(async () => {
    if (isOfflineModeEnabled) {
      const trackIds = await listTracks()
      for (const trackId of trackIds) {
        const verified = await verifyTrack(trackId)
        if (!verified) continue

        const track = await getTrackJson(trackId)
        const lineupTrack = {
          uid: makeUid(Kind.TRACKS, track.track_id),
          ...track
        }
        dispatch(loadTrack(lineupTrack))
        dispatch(
          cacheActions.add(
            Kind.TRACKS,
            [
              {
                id: track.track_id,
                uid: lineupTrack.uid,
                metadata: track
              }
            ],
            false,
            true
          )
        )
      }
    }
  }, [])

  return null
}
