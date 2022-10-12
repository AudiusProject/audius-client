import { exists } from 'react-native-fs'
import { useDispatch } from 'react-redux'
import { useAsync } from 'react-use'

import {
  getLocalTracksRoot,
  getTrackJson,
  listTracks,
  readDirRec,
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
      await readDirRec(getLocalTracksRoot())
      for (const trackId of trackIds) {
        console.log(`processing track ${trackId}`)
        const verified = await verifyTrack(trackId)
        console.log(`track ${trackId} verified: ${verified}`)
        const track = await getTrackJson(trackId)
        console.log('loading track json: ', track)
        dispatch(loadTrack(track))
      }
    }
  }, [])

  return null
}
