import { useCallback } from 'react'

import type { Track } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import { Switch, Text } from 'app/components/core'
import {
  downloadCollection,
  removeCollectionDownload
} from 'app/services/offline-downloader'
import {
  getOfflineDownloadStatus,
  getItemOfflineDownloadStatus
} from 'app/store/offline-downloads/selectors'
import { OfflineItemDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'

import { DownloadStatusIndicator } from './DownloadStatusIndicator'

type DownloadToggleProps = {
  collection?: string
  labelText?: string
  tracks: Track[]
}

const messages = {
  downloading: 'Downloading'
}

const useUnlabeledStyles = makeStyles(() => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  toggleContainer: {},
  flex1: {},
  iconTitle: {},
  labelText: {},
  purple: {}
}))

const useLabeledStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing(1)
  },
  flex1: {
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
    textTransform: 'uppercase',
    paddingLeft: spacing(1),
    flexBasis: 'auto'
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  purple: {
    color: palette.secondary
  }
}))

const useStyles = makeStyles<{ labeled: boolean }>(
  ({ palette, spacing }, props) => ({
    root: props.labeled
      ? {
          backgroundColor: 'red',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: spacing(1)
        }
      : {
          backgroundColor: 'blue',
          flexDirection: 'row',
          alignItems: 'center'
        },
    flex1: props.labeled
      ? {
          flex: 1
        }
      : {},
    iconTitle: (props) =>
      props.labeled
        ? {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 'auto',
            justifyContent: 'center'
          }
        : {},
    labelText: (props) =>
      props.labeled
        ? {
            color: palette.neutralLight4,
            fontSize: 14,
            letterSpacing: 2,
            textAlign: 'center',
            textTransform: 'uppercase',
            paddingLeft: spacing(1),
            flexBasis: 'auto'
          }
        : {},
    toggleContainer: (props) =>
      props.labeled
        ? {
            flexDirection: 'row',
            justifyContent: 'flex-end'
          }
        : {},
    purple: (props) =>
      props.labeled
        ? {
            color: palette.secondary
          }
        : {}
  })
)

export const DownloadToggle = ({
  tracks,
  collection,
  labelText
}: DownloadToggleProps) => {
  // const unlabeledStyles = useUnlabeledStyles()
  const labeledStyles = useLabeledStyles()
  // const styles = useStyles({ labeled: !!labelText })
  const styles = useStyles({ labeled: !!labelText })

  // const styles = labelText ? labeledStyles : unlabeledStyles
  const offlineDownloadStatus = useSelector(getOfflineDownloadStatus)
  const isAnyDownloadInProgress = tracks.some((track: Track) => {
    const status = offlineDownloadStatus[track.track_id.toString()]
    return status === OfflineItemDownloadStatus.LOADING
  })
  const collectionDownloadStatus = useSelector(
    getItemOfflineDownloadStatus(collection)
  )
  const isToggleOn =
    collectionDownloadStatus === OfflineItemDownloadStatus.SUCCESS ||
    collectionDownloadStatus === OfflineItemDownloadStatus.LOADING

  const handleToggleDownload = useCallback(
    (isDownloadEnabled: boolean) => {
      if (!collection) return
      if (isDownloadEnabled) {
        downloadCollection(
          collection,
          tracks.map((track) => track.track_id)
        )
      } else {
        removeCollectionDownload(
          collection,
          tracks.map((track) => track.track_id)
        )
      }
    },
    [collection, tracks]
  )

  if (!collection) return null
  return (
    <View style={styles.root}>
      {labelText && <View style={styles.flex1} />}
      <View style={[styles.iconTitle]}>
        <DownloadStatusIndicator itemId={collection} showNotDownloaded />
        {labelText ? (
          <Text style={[styles.labelText, isToggleOn && styles.purple]}>
            {isAnyDownloadInProgress ? messages.downloading : labelText}
          </Text>
        ) : null}
      </View>
      <View style={[styles.flex1, styles.toggleContainer]}>
        <Switch
          value={isToggleOn}
          onValueChange={handleToggleDownload}
          disabled={
            collectionDownloadStatus === OfflineItemDownloadStatus.LOADING
          }
        />
      </View>
    </View>
  )
}
