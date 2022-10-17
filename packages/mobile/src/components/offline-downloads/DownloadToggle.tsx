import { useCallback, useState } from 'react'

import type { Track } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import {
  downloadTrack,
  purgeAllDownloads
} from 'app/services/offline-downloader'
import {
  getOfflineDownloadStatus,
  getOfflineTracks
} from 'app/store/offline-downloads/selectors'
import { makeStyles } from 'app/styles'

import IconDownload from '../../assets/images/iconDownloadPurple.svg'
import IconNotDownloaded from '../../assets/images/iconNotDownloaded.svg'
import { Switch } from '../core/Switch'
import { TrackDownloadStatus } from 'app/store/offline-downloads/slice'

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
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  const styles = useStyles()
  const offlineDownloadStatus = useSelector(getOfflineDownloadStatus)
  const isDownloadFavoritesEnabled = tracks.some(
    (track: Track) =>
      offlineDownloadStatus[track.track_id.toString()] ===
        TrackDownloadStatus.LOADING ||
      offlineDownloadStatus[track.track_id.toString()] ===
        TrackDownloadStatus.SUCCESS
  )

  const handleToggleDownloadFavorites = useCallback(
    (isDownloadFavoritesEnabled: boolean) => {
      if (!isOfflineModeEnabled) return
      if (isDownloadFavoritesEnabled) {
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
      {isDownloadFavoritesEnabled ? <IconDownload /> : <IconNotDownloaded />}
      <Switch
        value={isDownloadFavoritesEnabled}
        onValueChange={handleToggleDownloadFavorites}
      />
    </View>
  )
}
