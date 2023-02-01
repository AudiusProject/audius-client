import type { ID } from '@audius/common'
import { cacheCollectionsSelectors, removeNullable } from '@audius/common'

import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useProxySelector } from 'app/hooks/useProxySelector'
import type { AppState } from 'app/store'
import {
  getIsCollectionMarkedForDownload,
  getTrackOfflineDownloadStatus
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

import { DownloadStatusIndicator } from './DownloadStatusIndicator'

const { getCollection } = cacheCollectionsSelectors

type CollectionDownloadIndicatorProps = {
  collectionId?: number
  size?: number
}

const getCollectionDownloadStatus = (
  state: AppState,
  collectionId?: ID
): OfflineDownloadStatus | null => {
  const collection = getCollection(state, { id: collectionId })
  if (!collection) return OfflineDownloadStatus.INACTIVE

  const isMarkedForDownload =
    getIsCollectionMarkedForDownload(collectionId)(state)

  if (!isMarkedForDownload) return null

  const playlistTracks = collection.playlist_contents.track_ids
  if (playlistTracks.length === 0) return OfflineDownloadStatus.SUCCESS

  const trackStatuses = playlistTracks
    .map(({ track: trackId }) => getTrackOfflineDownloadStatus(trackId)(state))
    .filter(removeNullable)

  if (trackStatuses.length === 0) return OfflineDownloadStatus.INIT

  if (trackStatuses.every((status) => status === OfflineDownloadStatus.INIT))
    return OfflineDownloadStatus.INIT

  if (trackStatuses.some((status) => status === OfflineDownloadStatus.LOADING))
    return OfflineDownloadStatus.LOADING

  if (
    trackStatuses.every(
      (status) =>
        status === OfflineDownloadStatus.SUCCESS ||
        status === OfflineDownloadStatus.ERROR
    )
  )
    return OfflineDownloadStatus.SUCCESS

  if (trackStatuses.every((status) => status === OfflineDownloadStatus.ERROR))
    return OfflineDownloadStatus.ERROR

  if (
    trackStatuses.every(
      (status) =>
        status === OfflineDownloadStatus.INIT ||
        status === OfflineDownloadStatus.SUCCESS ||
        status === OfflineDownloadStatus.ERROR
    )
  )
    return OfflineDownloadStatus.LOADING

  return OfflineDownloadStatus.INIT
}

export const CollectionDownloadStatusIndicator = (
  props: CollectionDownloadIndicatorProps
) => {
  const { collectionId, ...other } = props
  const isOfflineModeEnabled = useIsOfflineModeEnabled()

  const status = useProxySelector(
    (state) => getCollectionDownloadStatus(state, collectionId),
    [collectionId]
  )

  if (!isOfflineModeEnabled) return null

  return <DownloadStatusIndicator status={status} {...other} />
}
