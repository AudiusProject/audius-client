// TODO: move to hooks

import {
  FeatureFlags,
  savedPageTracksLineupActions,
  reachabilitySelectors
} from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useAsync } from 'react-use'

import { useFeatureFlag } from 'app/hooks/useRemoteConfig'

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
    if (!isOfflineModeEnabled || isReachable) {
      return
    }
    const trackIds = await listTracks()
    const trackJsons = await Promise.all(
      trackIds.map((trackId) => getTrackJson(trackId))
    )
    dispatch(
      savedPageTracksLineupActions.fetchLineupMetadatasSucceeded(
        trackJsons,
        0,
        0,
        false,
        false
      )
    )
  })
}
