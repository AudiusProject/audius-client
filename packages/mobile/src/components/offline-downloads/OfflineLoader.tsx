import type { Track } from '@audius/common'
import {
  cacheActions,
  Kind,
  makeUid,
  savedPageTracksLineupActions
} from '@audius/common'
import moment from 'moment'
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
      const lineupTracks: (Track & { uid: string })[] = []
      for (const trackId of trackIds) {
        console.log(`processing track ${trackId}`)
        const verified = await verifyTrack(trackId)
        console.log(`track ${trackId} verified: ${verified}`)
        const track = await getTrackJson(trackId)
        console.log('loading track json: ', track)
        const lineupTrack = {
          uid: makeUid(Kind.TRACKS, track.track_id),
          ...track
        }
        lineupTracks.push(lineupTrack)
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

      dispatch(
        savedPageTracksLineupActions.fetchLineupMetadatasSucceeded(
          lineupTracks.map((track) => ({
            uid: track.uid,
            kind: Kind.TRACKS,
            id: track.track_id,
            dateSaved: moment()
          })),
          0,
          lineupTracks.length,
          false,
          false
        )
      )
    }
  }, [])

  return null
}
