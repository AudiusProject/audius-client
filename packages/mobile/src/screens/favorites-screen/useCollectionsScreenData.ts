import type { CollectionType } from '@audius/common'
import {
  accountSelectors,
  cacheCollectionsSelectors,
  reachabilitySelectors,
  shallowCompare,
  Status,
  useAllPaginatedQuery,
  useGetLibraryAlbums,
  useGetLibraryPlaylists,
  useProxySelector,
  savedPageSelectors
} from '@audius/common'
import { useSelector } from 'react-redux'

import { useOfflineTracksStatus } from 'app/hooks/useOfflineTrackStatus'
import type { AppState } from 'app/store'
import {
  getIsDoneLoadingFromDisk,
  getOfflineCollectionsStatus
} from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

const { getIsReachable } = reachabilitySelectors
const { getUserId } = accountSelectors
const { getCollection } = cacheCollectionsSelectors
const { getSelectedCategory } = savedPageSelectors

type UseCollectionsScreenDataConfig = {
  filterValue?: string
  collectionType: CollectionType
}

export const useCollectionsScreenData = ({
  collectionType,
  filterValue = ''
}: UseCollectionsScreenDataConfig) => {
  const isDoneLoadingFromDisk = useSelector(getIsDoneLoadingFromDisk)
  const isReachable = useSelector(getIsReachable)
  const selectedCategory = useSelector(getSelectedCategory)
  const currentUserId = useSelector(getUserId)
  const offlineTracksStatus = useOfflineTracksStatus({ skipIfOnline: true })

  const {
    data: collectionsData,
    status: fetchedStatus,
    hasMore,
    isLoadingMore,
    loadMore: fetchMore
  } = useAllPaginatedQuery(
    collectionType === 'albums' ? useGetLibraryAlbums : useGetLibraryPlaylists,
    {
      category: selectedCategory,
      userId: currentUserId!
    },
    {
      pageSize: 20,
      disabled: currentUserId == null || !isReachable
    }
  )
  const fetchedCollectionIds = collectionsData?.map((c) => c.playlist_id)

  // TODO: Filter collections using `filterCollections` from Common if all loaded, or by changing fetch args if not all loaded

  const availableCollectionIds = useProxySelector(
    (state: AppState) => {
      if (isReachable) {
        return fetchedCollectionIds
      }

      if (!isDoneLoadingFromDisk) {
        return []
      }

      return fetchedCollectionIds.filter((collectionId) => {
        const collection = getCollection(state, { id: collectionId })
        if (collection == null) {
          console.error(
            `Unexpected missing fetched collection: ${collectionId}`
          )
          return false
        }

        if (!isReachable) {
          const offlineCollectionsStatus = getOfflineCollectionsStatus(state)
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
      isDoneLoadingFromDisk,
      offlineTracksStatus
    ],
    shallowCompare
  )

  let status: Status
  if (isReachable) {
    status = hasMore || isLoadingMore ? Status.LOADING : fetchedStatus
  } else {
    status = isDoneLoadingFromDisk ? Status.SUCCESS : Status.LOADING
  }

  return {
    collectionIds: availableCollectionIds,
    hasMore,
    fetchMore,
    status
  }
}
