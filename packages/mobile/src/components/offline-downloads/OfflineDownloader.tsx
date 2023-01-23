import { useEffect, useState } from 'react'

import { reachabilitySelectors } from '@audius/common'
import queue from 'react-native-job-queue'
import { useSelector } from 'react-redux'

import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useLoadOfflineData } from 'app/hooks/useLoadOfflineTracks'
import { startDownloadWorker } from 'app/services/offline-downloader'

const { getIsReachable } = reachabilitySelectors

export const OfflineDownloader = () => {
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized && isOfflineModeEnabled) {
      setInitialized(true)
      startDownloadWorker()
    }
  }, [initialized, isOfflineModeEnabled])

  useLoadOfflineData()

  const isReachable = useSelector(getIsReachable)

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
