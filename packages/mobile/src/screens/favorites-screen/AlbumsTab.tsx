import { useCallback, useState } from 'react'

import { reachabilitySelectors, statusIsNotFinalized } from '@audius/common'
import { useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'
import { VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'

import { FilterInput } from './FilterInput'
import { LoadingMoreSpinner } from './LoadingMoreSpinner'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
import { useCollectionScreenData } from './useCollectionScreenData'

const { getIsReachable } = reachabilitySelectors

const messages = {
  emptyTabText: "You haven't favorited any albums yet.",
  inputPlaceholder: 'Filter Albums'
}

export const AlbumsTab = () => {
  const [filterValue, setFilterValue] = useState('')
  const {
    collectionIds: userAlbums,
    hasMore,
    fetchMore,
    status
  } = useCollectionScreenData({
    filterValue,
    collectionType: 'albums'
  })
  const isReachable = useSelector(getIsReachable)
  const isOfflineModeEnabled = useIsOfflineModeEnabled()

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      fetchMore()
    }
  }, [hasMore, fetchMore])

  const loadingSpinner = <LoadingMoreSpinner />

  return (
    <VirtualizedScrollView>
      {!statusIsNotFinalized(status) && !userAlbums?.length && !filterValue ? (
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
            onEndReached={handleEndReached}
            onEndReachedThreshold={1}
            scrollEnabled={false}
            collectionIds={userAlbums}
            ListFooterComponent={
              statusIsNotFinalized(status) ? loadingSpinner : null
            }
            style={{ marginVertical: 12 }}
          />
        </>
      )}
    </VirtualizedScrollView>
  )
}
