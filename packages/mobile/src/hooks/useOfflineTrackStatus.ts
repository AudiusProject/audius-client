import { reachabilitySelectors, useProxySelector } from '@audius/common'
import { useSelector } from 'react-redux'

import type { AppState } from 'app/store'
import {
  getIsDoneLoadingFromDisk,
  getOfflineTrackStatus
} from 'app/store/offline-downloads/selectors'

const { getIsReachable } = reachabilitySelectors

const emptyTrackStatus = {}

type UseOfflineTrackStatusConfig = {
  /* Return empty if we are online. Useful as a performance optimization */
  skipIfOnline?: boolean
}

/** Returns a mapping of tracks to their offline download status. Can be configured
 * to skip updates when online as a performance optimization
 */
export function useOfflineTracksStatus({
  skipIfOnline = false
}: UseOfflineTrackStatusConfig = {}) {
  const isDoneLoadingFromDisk = useSelector(getIsDoneLoadingFromDisk)
  const isReachable = useSelector(getIsReachable)
  const skipUpdate = skipIfOnline && isReachable
  return useProxySelector(
    (state: AppState) => {
      if (skipUpdate || !isDoneLoadingFromDisk) {
        return emptyTrackStatus
      }
      return getOfflineTrackStatus(state)
    },
    [skipUpdate, isDoneLoadingFromDisk]
  )
}
