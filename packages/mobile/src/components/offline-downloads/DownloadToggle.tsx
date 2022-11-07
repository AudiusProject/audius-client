import { useCallback } from 'react'

import type { Track } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import {
  downloadTrack,
  purgeAllDownloads
} from 'app/services/offline-downloader'
import type { AppState } from 'app/store'
import { getOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { TrackDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import IconDownload from '../../assets/images/iconDownloadPurple.svg'
import IconNotDownloaded from '../../assets/images/iconNotDownloaded.svg'
import { Switch } from '../core/Switch'

type DownloadToggleProps = {
  collection?: string
  labelText?: string
  tracks: Track[]
}

const messages = {
  downloading: 'Downloading'
}

const useStyles = makeStyles(({ palette }) => ({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  oneThirdContainer: {
    flex: 1
  },
  iconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    justifyContent: 'center'
  },
  labelText: {
    color: palette.neutralLight4,
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  toggle: {
    flexDirection: 'row',
    alignSelf: 'flex-end'
  }
}))

export const DownloadToggle = ({
  tracks,
  collection,
  labelText
}: DownloadToggleProps) => {
  const styles = useStyles()
  const offlineDownloadStatus = useSelector(getOfflineDownloadStatus)
  const isAnyDownloadInProgress = tracks.some((track: Track) => {
    const status = offlineDownloadStatus[track.track_id.toString()]
    return status === TrackDownloadStatus.LOADING
  })
  const isToggleOn = useSelector((state: AppState) => {
    return tracks.some((track: Track) => {
      const status = offlineDownloadStatus[track.track_id.toString()]
      return (
        status === TrackDownloadStatus.LOADING ||
        status === TrackDownloadStatus.SUCCESS
      )
    })
  })

  const handleToggleDownload = useCallback(
    (isDownloadEnabled: boolean) => {
      if (!collection) return
      if (isDownloadEnabled) {
        tracks.forEach((track) => {
          downloadTrack(track.track_id, collection)
        })
      } else {
        // TODO: remove only downloads associated with this collection
        purgeAllDownloads()
      }
    },
    [collection, tracks]
  )

  return (
    <View style={styles.root}>
      {labelText && <View style={styles.oneThirdContainer} />}
      <View style={[styles.oneThirdContainer, styles.iconTitle]}>
        {isToggleOn ? <IconDownload /> : <IconNotDownloaded />}
        {!!labelText && (
          <Text style={styles.labelText}>
            {isAnyDownloadInProgress ? messages.downloading : labelText}
          </Text>
        )}
      </View>
      <View style={styles.oneThirdContainer}>
        <Switch
          style={styles.toggle}
          value={isToggleOn}
          onValueChange={handleToggleDownload}
          disabled={!collection}
        />
      </View>
    </View>
  )
}
