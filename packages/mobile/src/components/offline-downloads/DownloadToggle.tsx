import { useCallback } from 'react'

import type { Track } from '@audius/common'
import { FeatureFlags } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import {
  downloadTrack,
  purgeAllDownloads
} from 'app/services/offline-downloader'
import { getOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { TrackDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import IconDownload from '../../assets/images/iconDownloadPurple.svg'
import IconNotDownloaded from '../../assets/images/iconNotDownloaded.svg'
import { Switch } from '../core/Switch'

type DownloadToggleProps = {
  collection: string
  tracks: Track[]
}

const useStyles = makeStyles(() => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center'
  }
}))

export const DownloadToggle = ({ tracks, collection }: DownloadToggleProps) => {
  const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
    FeatureFlags.OFFLINE_MODE_ENABLED
  )
  const styles = useStyles()
  const offlineDownloadStatus = useSelector(getOfflineDownloadStatus)
  const isDownloadEnabled = tracks.some(
    (track: Track) =>
      offlineDownloadStatus[track.track_id.toString()] ===
        TrackDownloadStatus.LOADING ||
      offlineDownloadStatus[track.track_id.toString()] ===
        TrackDownloadStatus.SUCCESS
  )

  const handleToggleDownload = useCallback(
    (isDownloadEnabled: boolean) => {
      if (!isOfflineModeEnabled) return
      if (isDownloadEnabled) {
        tracks.forEach((track) => {
          downloadTrack(track.track_id, collection)
        })
      } else {
        purgeAllDownloads()
      }
    },
    [collection, isOfflineModeEnabled, tracks]
  )
  return (
    <View style={styles.root}>
      {isDownloadEnabled ? <IconDownload /> : <IconNotDownloaded />}
      <Switch value={isDownloadEnabled} onValueChange={handleToggleDownload} />
    </View>
  )
}
