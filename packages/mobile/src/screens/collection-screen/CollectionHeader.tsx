import { useCallback } from 'react'

import type { Collection, SmartCollectionVariant } from '@audius/common'
import {
  FavoriteSource,
  accountSelectors,
  reachabilitySelectors,
  collectionPageSelectors,
  collectionsSocialActions,
  Variant
} from '@audius/common'
import { View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

import { Switch, Text } from 'app/components/core'
import { getCollectionDownloadStatus } from 'app/components/offline-downloads/CollectionDownloadStatusIndicator'
import { DownloadStatusIndicator } from 'app/components/offline-downloads/DownloadStatusIndicator'
import { useDebouncedCallback } from 'app/hooks/useDebouncedCallback'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useProxySelector } from 'app/hooks/useProxySelector'
import {
  batchDownloadCollection,
  DOWNLOAD_REASON_FAVORITES
} from 'app/services/offline-downloader'
import { setVisibility } from 'app/store/drawers/slice'
import { getIsCollectionMarkedForDownload } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { makeStyles } from 'app/styles'
const { getUserId } = accountSelectors
const { getCollection } = collectionPageSelectors
const { saveCollection } = collectionsSocialActions
const { getIsReachable } = reachabilitySelectors

const messages = {
  album: 'Album',
  playlist: 'Playlist',
  empty: 'This playlist is empty.',
  privatePlaylist: 'Private Playlist',
  publishing: 'Publishing...',
  queued: 'Download Queued',
  downloading: 'Downloading'
}

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing(1)
  },
  headerLeft: {
    flex: 1
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexBasis: 'auto'
  },
  downloadStatusIndicator: {
    marginRight: spacing(2)
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  headerText: {
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  rootLegacy: {
    marginVertical: spacing(2)
  }
}))

type CollectionHeaderProps = {
  collectionId?: number | SmartCollectionVariant
}

export const CollectionHeader = (props: CollectionHeaderProps) => {
  const { collectionId } = props
  const collection = useSelector((state) =>
    getCollection(
      state,
      typeof collectionId === 'number' ? { id: collectionId } : undefined
    )
  )
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const styles = useStyles()

  const getHeaderText = () => {
    if (!collection) return messages.playlist
    if (collection.variant === Variant.SMART) return messages.playlist
    const { _is_publishing, is_album, is_private } = collection

    if (_is_publishing) return messages.publishing
    if (is_album) return messages.album
    if (is_private) return messages.privatePlaylist
    return messages.playlist
  }

  if (isOfflineModeEnabled && collection?.variant === Variant.USER_GENERATED) {
    return (
      <OfflineCollectionHeader
        headerText={getHeaderText()}
        collection={collection}
      />
    )
  }

  return (
    <View style={styles.rootLegacy}>
      <Text
        style={styles.headerText}
        color='neutralLight4'
        weight='demiBold'
        fontSize='small'
      >
        {getHeaderText()}
      </Text>
    </View>
  )
}

type OfflineCollectionHeaderProps = {
  collection: Collection
  headerText: string
}

const OfflineCollectionHeader = (props: OfflineCollectionHeaderProps) => {
  const styles = useStyles()
  const { collection, headerText } = props
  const { playlist_id } = collection
  const dispatch = useDispatch()
  const currentUserId = useSelector(getUserId)
  const isReachable = useSelector(getIsReachable)

  const isMarkedForDownload = useSelector(
    getIsCollectionMarkedForDownload(playlist_id)
  )

  const isFavoritesToggleOn = useSelector(
    getIsCollectionMarkedForDownload(DOWNLOAD_REASON_FAVORITES)
  )

  const downloadStatus = useProxySelector(
    (state) => {
      const status = getCollectionDownloadStatus(state, playlist_id)
      return isMarkedForDownload ? status : OfflineDownloadStatus.INACTIVE
    },
    [isMarkedForDownload, playlist_id]
  )

  const handleToggleDownload = useCallback(
    (isDownloadEnabled: boolean) => {
      if (isDownloadEnabled) {
        batchDownloadCollection([collection], false)
        const isOwner = currentUserId === collection.playlist_owner_id
        if (!collection.has_current_user_saved && !isOwner) {
          dispatch(
            saveCollection(
              collection.playlist_id,
              FavoriteSource.OFFLINE_DOWNLOAD
            )
          )
        }
      } else {
        dispatch(
          setVisibility({
            drawer: 'RemoveDownloadedCollection',
            visible: true,
            data: { collectionId: playlist_id }
          })
        )
      }
    },
    [collection, currentUserId, dispatch, playlist_id]
  )

  const debouncedHandleToggleDownload = useDebouncedCallback(
    handleToggleDownload,
    800
  )

  const getTextColor = () => {
    if (
      downloadStatus === OfflineDownloadStatus.INACTIVE ||
      downloadStatus === OfflineDownloadStatus.INIT
    )
      return 'neutralLight4'
    return 'secondary'
  }

  return (
    <View style={styles.root}>
      <View style={styles.headerLeft} />
      <View style={styles.headerCenter}>
        <DownloadStatusIndicator
          status={downloadStatus}
          style={styles.downloadStatusIndicator}
        />
        <Text
          style={styles.headerText}
          color={getTextColor()}
          weight='demiBold'
          fontSize='small'
        >
          {downloadStatus === OfflineDownloadStatus.LOADING
            ? messages.downloading
            : headerText}
        </Text>
      </View>
      <View style={styles.headerRight}>
        <Switch
          defaultValue={isMarkedForDownload}
          onValueChange={debouncedHandleToggleDownload}
          disabled={
            isFavoritesToggleOn || (!isReachable && !isMarkedForDownload)
          }
        />
      </View>
    </View>
  )
}
