import { useMemo } from 'react'

import type { CollectionType } from '@audius/common'
import {
  cacheCollectionsSelectors,
  filterCollections,
  reachabilitySelectors,
  shallowCompare,
  useFetchedSavedCollections,
  useProxySelector,
  useSavedAlbums,
  useSavedPlaylists
} from '@audius/common'
import { useSelector } from 'react-redux'

import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useOfflineTracksStatus } from 'app/hooks/useOfflineTrackStatus'
import type { AppState } from 'app/store'
import {
  getIsDoneLoadingFromDisk,
  getOfflineCollectionsStatus
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

const { getIsReachable } = reachabilitySelectors
const { getCollection } = cacheCollectionsSelectors

type UseCollectionScreenDataConfig = {
  filterValue?: string
  collectionType: CollectionType
}

export const useCollectionScreenData = ({
  collectionType,
  filterValue = ''
}: UseCollectionScreenDataConfig) => {
  const isDoneLoadingFromDisk = useSelector(getIsDoneLoadingFromDisk)
  const isReachable = useSelector(getIsReachable)
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const offlineTracksStatus = useOfflineTracksStatus()

  const { data: accountAlbums } = useSavedAlbums()
  const { data: accountPlaylists } = useSavedPlaylists()

  // TODO: Need to use this status somewhere?
  const unfilteredCollections =
    collectionType === 'albums' ? accountAlbums : accountPlaylists

  const collectionIds = useMemo(
    () =>
      filterCollections(unfilteredCollections, {
        filterText: filterValue
      }).map((c) => c.id),
    [unfilteredCollections, filterValue]
  )

  const {
    data: fetchedCollectionIds,
    fetchMore,
    hasMore,
    status
  } = useFetchedSavedCollections({
    collectionIds,
    type: collectionType,
    pageSize: 20
  })

  const availableCollectionIds = useProxySelector(
    (state: AppState) => {
      if (!isOfflineModeEnabled || isReachable) {
        return fetchedCollectionIds
      }

      if (!isDoneLoadingFromDisk) {
        return []
      }

      const offlineCollectionsStatus = getOfflineCollectionsStatus(state)
      return fetchedCollectionIds.filter((collectionId) => {
        const collection = getCollection(state, { id: collectionId })
        if (collection == null) {
          console.error(
            `Unexpected missing fetched collection: ${collectionId}`
          )
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
      fetchedCollectionIds,
      isReachable,
      isOfflineModeEnabled,
      isDoneLoadingFromDisk,
      offlineTracksStatus
    ],
    shallowCompare
  )

  return {
    collectionIds: availableCollectionIds,
    hasMore,
    fetchMore,
    status
  }
}
