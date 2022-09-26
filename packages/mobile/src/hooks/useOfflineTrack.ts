import { useEffect, useState } from 'react'

import type { Track } from '@audius/common'

import {
  getAudioDestination,
  isTrackAvailableOffline
} from 'app/services/offline-downloader'
import { pathJoin } from 'app/utils/fileSystem'

export const useOfflineTrackUri = (track: Track | null) => {
  const [offlineSrc, setOfflineSrc] = useState<String | null>()
  useEffect(() => {
    const checkTrackAvailableOffline = async () => {
      if (!track) return
      if (!(await isTrackAvailableOffline(track))) return
      const audioFilePath = pathJoin(...getAudioDestination(track))
      setOfflineSrc(`file://${audioFilePath}`)
    }
    checkTrackAvailableOffline()
  }, [track])
  return offlineSrc
}
