import { useMemo } from 'react'

import { cacheCollectionsSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import {
  getIsCollectionMarkedForDownload,
  getIsAnyDownloadInProgress,
  getIsAllDownloadsErrored
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

import { DownloadStatusIndicator } from './DownloadStatusIndicator'

const { getCollection } = cacheCollectionsSelectors

type CollectionDownloadIndicatorProps = {
  collectionId?: string
  size?: number
}

export const CollectionDownloadStatusIndicator = (
  props: CollectionDownloadIndicatorProps
) => {
  const { collectionId, ...other } = props
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isMarkedForDownload = useSelector(
    getIsCollectionMarkedForDownload(collectionId)
  )

  const collection = useSelector((state) =>
    getCollection(state, {
      id: isMarkedForDownload && collectionId ? parseInt(collectionId) : null
    })
  )

  const trackIds = useMemo(() => {
    return (
      collection?.playlist_contents?.track_ids?.map(
        (trackData) => trackData.track
      ) ?? []
    )
  }, [collection])

  const isAnyDownloadInProgress = useSelector((state) =>
    getIsAnyDownloadInProgress(state, trackIds)
  )

  const isAllDownloadsErrored = useSelector((state) =>
    getIsAllDownloadsErrored(state, trackIds)
  )

  const downloadStatus = isMarkedForDownload
    ? isAnyDownloadInProgress
      ? OfflineDownloadStatus.LOADING
      : isAllDownloadsErrored
      ? OfflineDownloadStatus.ERROR
      : OfflineDownloadStatus.SUCCESS
    : null

  if (!isOfflineModeEnabled) return null

  return <DownloadStatusIndicator status={downloadStatus} {...other} />
}
