import { reachabilitySelectors, useProxySelector } from '@audius/common'
import { useSelector } from 'react-redux'

import type { AppState } from 'app/store'
import {
  getIsDoneLoadingFromDisk,
  getOfflineTrackStatus
} from 'app/store/offline-downloads/selectors'

const { getIsReachable } = reachabilitySelectors

const emptyTrackStatus = {}

export function useOfflineTracksStatus() {
  const isDoneLoadingFromDisk = useSelector(getIsDoneLoadingFromDisk)
  const isReachable = useSelector(getIsReachable)
  return useProxySelector(
    (state: AppState) => {
      if (isDoneLoadingFromDisk && !isReachable) {
        return getOfflineTrackStatus(state)
      }
      // We don't need offline download status when we're not offline. This saves us rerenders while we're downloading things and updating the offline download slice.
      return emptyTrackStatus
    },
    [isReachable, isDoneLoadingFromDisk]
  )
}
