// TODO: move to hooks

import type { Track } from '@audius/common'
import {
  FeatureFlags,
  Kind,
  makeUid,
  cacheActions,
  savedPageTracksLineupActions
} from '@audius/common'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { loadTracks } from 'app/store/offline-downloads/slice'

import { DOWNLOAD_REASON_FAVORITES } from '../services/offline-downloader/offline-downloader'
import {
  getTrackJson,
  listTracks,
  verifyTrack
} from '../services/offline-downloader/offline-storage'

export const useLoadOfflineTracks = async () => {
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  const dispatch = useDispatch()

  useAsync(async () => {
    if (!isOfflineModeEnabled) return

    const trackIds = await listTracks()
    const tracks: Track[] = []
    const savesLineupTracks: (Track & { uid: string })[] = []
    const cacheTracks: { uid: string; id: number; metadata: Track }[] = []
    for (const trackId of trackIds) {
      const verified = await verifyTrack(trackId)
      if (!verified) continue
      getTrackJson(trackId)
        .then((track) => {
          tracks.push(track)
          const lineupTrack = {
            uid: makeUid(Kind.TRACKS, track.track_id),
            ...track
          }
          cacheTracks.push({
            id: track.track_id,
            uid: lineupTrack.uid,
            metadata: track
          })
          if (
            track.offline?.downloaded_from_collection.includes(
              DOWNLOAD_REASON_FAVORITES
            )
          ) {
            savesLineupTracks.push(lineupTrack)
          }
        })
        .catch(() => console.warn('Failed to load track from disk', trackId))
    }
    dispatch(loadTracks(savesLineupTracks))
    dispatch(cacheActions.add(Kind.TRACKS, cacheTracks, false, true))
    dispatch(
      savedPageTracksLineupActions.fetchLineupMetadatasSucceeded(
        savesLineupTracks.map((track) => ({
          uid: track.uid,
          kind: Kind.TRACKS,
          id: track.track_id,
          dateSaved: moment()
        })),
        0,
        savesLineupTracks.length,
        false,
        false
      )
    )
  }, [isOfflineModeEnabled, loadTracks])
}
