import { useCallback, useState } from 'react'

import type { Track } from '@audius/common'
import { View } from 'react-native'

import {
  downloadTrack,
  DOWNLOAD_REASON_FAVORITES,
  purgeAllDownloads
} from 'app/services/offline-downloader'
import { makeStyles } from 'app/styles'

import IconDownload from '../../assets/images/iconDownloadPurple.svg'
import IconNotDownloaded from '../../assets/images/iconNotDownloaded.svg'
import { Switch } from '../core/Switch'

type DownloadToggleProps = {
  tracks: Track[]
}

const useStyles = makeStyles(() => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center'
  }
}))

export const DownloadToggle = ({ tracks }: DownloadToggleProps) => {
  //   const { isEnabled: isOfflineModeEnabled } = useFeatureFlag(
  //     FeatureFlags.OFFLINE_MODE_ENABLED
  //   )
  const isOfflineModeEnabled = true
  const styles = useStyles()

  const [isDownloadFavoritesEnabled, setDownloadFavoritesEnabled] =
    useState(false)
  const handleToggleDownloadFavorites = useCallback(
    (isDownloadFavoritesEnabled: boolean) => {
      if (!isOfflineModeEnabled) return
      if (isDownloadFavoritesEnabled) {
        tracks.forEach((track) => {
          downloadTrack(track.track_id, DOWNLOAD_REASON_FAVORITES)
        })
      } else {
        purgeAllDownloads()
      }
      setDownloadFavoritesEnabled(isDownloadFavoritesEnabled)
    },
    [isOfflineModeEnabled, tracks]
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
