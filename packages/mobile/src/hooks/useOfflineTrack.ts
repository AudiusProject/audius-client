import { FeatureFlags } from '@audius/common'
import { useAsync } from 'react-use'

import {
  getLocalAudioPath,
  isAudioAvailableOffline
} from 'app/services/offline-downloader'

import { useFeatureFlag } from './useRemoteConfig'

export const useOfflineTrackUri = (trackId?: string) => {
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  return useAsync(async () => {
    console.log('useOfflineTrack', trackId)
    if (!trackId || !isOfflineModeEnabled) return
    const available = await isAudioAvailableOffline(trackId)
    console.log(available)
    if (!(await isAudioAvailableOffline(trackId))) return
    const audioFilePath = getLocalAudioPath(trackId)
    return `file://${audioFilePath}`
  }, [trackId])
}
