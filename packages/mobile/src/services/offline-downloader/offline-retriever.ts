// TODO: move to hooks

import { FeatureFlags, reachabilitySelectors, Track } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { loadTracks } from 'app/store/offline-downloads/slice'

import { getTrackJson, listTracks } from './offline-storage'
const { getIsReachable } = reachabilitySelectors

export const useLoadStoredTracks = async () => {
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  const dispatch = useDispatch()
  const isReachable = useSelector(getIsReachable)

  useAsync(async () => {
    console.log('got here')
    // if (!isOfflineModeEnabled || isReachable) {
    //   console.log(
    //     'skipping offline track load: ',
    //     isOfflineModeEnabled ? 'offline enabled' : 'offline disabled',
    //     isReachable ? 'reachable' : 'not reachable'
    //   )
    //   return
    // }

    const trackIds = await listTracks()
    const trackJsons: Track[] = []
    for (const trackId of trackIds) {
      getTrackJson(trackId)
        .then((trackJson) => trackJsons.push(trackJson))
        .catch(() => console.warn('Failed to load track from disk', trackId))
    }
    dispatch(loadTracks(trackJsons))
  }, [isOfflineModeEnabled, isReachable, loadTracks])
}
