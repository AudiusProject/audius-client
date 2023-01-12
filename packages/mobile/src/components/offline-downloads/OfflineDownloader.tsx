import { useEffect, useState } from 'react'

import { accountSelectors, reachabilitySelectors } from '@audius/common'
import queue from 'react-native-job-queue'
import { useSelector } from 'react-redux'

import {
  useIsOfflineModeEnabled,
  useReadOfflineOverride
} from 'app/hooks/useIsOfflineModeEnabled'
import { useLoadOfflineData } from 'app/hooks/useLoadOfflineTracks'
import { startDownloadWorker, startSync } from 'app/services/offline-downloader'
import { getIsDoneLoadingFromDisk } from 'app/store/offline-downloads/selectors'

const { getUserId } = accountSelectors
const { getIsReachable } = reachabilitySelectors

export const OfflineDownloader = () => {
  useReadOfflineOverride()
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized && isOfflineModeEnabled) {
      setInitialized(true)
      startDownloadWorker()
    }
  }, [initialized, isOfflineModeEnabled])

  useLoadOfflineData()

  const [syncStarted, setSyncStarted] = useState(false)
  const currentUserId = useSelector(getUserId)
  const isReachable = useSelector(getIsReachable)
  const isDoneLoadingFromDisk = useSelector(getIsDoneLoadingFromDisk)

  // TODO: move this to a saga so we can wait until latest account is loaded
  useEffect(() => {
    if (!syncStarted && currentUserId && isDoneLoadingFromDisk && isReachable) {
      setSyncStarted(true)
      startSync()
    }
  }, [syncStarted, currentUserId, isDoneLoadingFromDisk, isReachable])

  useEffect(() => {
    if (!initialized) return
    const isQueueRunning = queue.isRunning

    if (isReachable && !isQueueRunning) {
      queue.start()
    } else if (!isReachable && isQueueRunning) {
      queue.stop()
    }
  }, [initialized, isReachable])

  return null
}
