import { useMemo, useState } from 'react'

import {
  useProxySelector,
  reachabilitySelectors,
  shallowCompare
} from '@audius/common'
import { useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'
import { VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import type { AppState } from 'app/store'
import {
  getOfflineTrackStatus,
  getIsDoneLoadingFromDisk,
  getOfflineCollectionsStatus
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

import { FilterInput } from './FilterInput'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
import { getAccountCollections } from './selectors'
import { buildCollectionIdsToNumPlayableTracksMap } from './utils'

const { getIsReachable } = reachabilitySelectors

const messages = {
  emptyTabText: "You haven't favorited any albums yet.",
  inputPlaceholder: 'Filter Albums'
}

export const AlbumsTab = () => {
  const [filterValue, setFilterValue] = useState('')
  const isReachable = useSelector(getIsReachable)
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isDoneLoadingFromDisk = useSelector(getIsDoneLoadingFromDisk)

  const offlineTracksStatus = useProxySelector(
    (state: AppState) => {
      if (isDoneLoadingFromDisk && isOfflineModeEnabled && !isReachable) {
        return getOfflineTrackStatus(state)
      }
      // We don't need offline download status when we're not offline. This saves us rerenders while we're downloading things and updating the offline download slice.
      return undefined
    },
    [isReachable, isOfflineModeEnabled, isDoneLoadingFromDisk]
  )

  const userAlbums = useProxySelector(
    (state: AppState) => {
      if (isOfflineModeEnabled && !isReachable) {
        if (!isDoneLoadingFromDisk) {
          return []
        }
      }
      const offlineCollectionsStatus = getOfflineCollectionsStatus(state)
      return getAccountCollections(state, filterValue).filter((collection) => {
        if (!collection.is_album) {
          return false
        }
        if (isOfflineModeEnabled && !isReachable) {
          const trackIds =
            collection.playlist_contents.track_ids.map(
              (trackData) => trackData.track
            ) ?? []
          const collectionDownloadStatus =
            offlineCollectionsStatus[collection.playlist_id]
          // Don't show a playlist in Offline Mode if it has at least one track but none of the tracks have been downloaded yet OR if it is not marked for download
          return (
            collection.is_album &&
            Boolean(collectionDownloadStatus) &&
            collectionDownloadStatus !== OfflineDownloadStatus.INACTIVE &&
            (trackIds.length === 0 ||
              trackIds.some((t) => {
                return (
                  offlineTracksStatus &&
                  offlineTracksStatus[t.toString()] ===
                    OfflineDownloadStatus.SUCCESS
                )
              }))
          )
        }
        return true
      })
    },
    [
      filterValue,
      isReachable,
      isOfflineModeEnabled,
      isDoneLoadingFromDisk,
      offlineTracksStatus
    ],
    shallowCompare
  )

  const numPlayableTracksMap = useMemo(() => {
    return buildCollectionIdsToNumPlayableTracksMap(
      userAlbums,
      isOfflineModeEnabled && !isReachable,
      offlineTracksStatus || {}
    )
  }, [isOfflineModeEnabled, isReachable, offlineTracksStatus, userAlbums])

  return (
    <VirtualizedScrollView listKey='favorites-albums-view'>
      {!userAlbums?.length && !filterValue ? (
        isOfflineModeEnabled && !isReachable ? (
          <NoTracksPlaceholder />
        ) : (
          <EmptyTileCTA message={messages.emptyTabText} />
        )
      ) : (
        <>
          <OfflineContentBanner />
          <FilterInput
            value={filterValue}
            placeholder={messages.inputPlaceholder}
            onChangeText={setFilterValue}
          />
          <CollectionList
            listKey='favorites-albums'
            scrollEnabled={false}
            collection={userAlbums}
            collectionIdsToNumTracks={numPlayableTracksMap}
            style={{ marginVertical: 12 }}
          />
        </>
      )}
    </VirtualizedScrollView>
  )
}
