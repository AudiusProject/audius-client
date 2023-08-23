import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'

import {
  reachabilitySelectors,
  statusIsNotFinalized,
  useAllPaginatedQuery,
  accountSelectors,
  useGetLibraryAlbums
} from '@audius/common'
import { useSelector } from 'react-redux'

import { CollectionList } from 'app/components/collection-list'
import { VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'

import { FilterInput } from './FilterInput'
import { LoadingMoreSpinner } from './LoadingMoreSpinner'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'

const { getUserId } = accountSelectors
const { getIsReachable } = reachabilitySelectors

const messages = {
  emptyTabText: "You haven't favorited any albums yet.",
  inputPlaceholder: 'Filter Albums'
}

export const AlbumsTab = () => {
  const [filterValue, setFilterValue] = useState('')
  const currentUserId = useSelector(getUserId)
  const isReachable = useSelector(getIsReachable)

  const {
    data: fetchedAlbums,
    status,
    hasMore,
    loadMore: fetchMore
  } = useAllPaginatedQuery(
    useGetLibraryAlbums,
    {
      userId: currentUserId!
    },
    {
      pageSize: 20,
      disabled: currentUserId == null || !isReachable
    }
  )

  const albumsIds = fetchedAlbums?.map((a) => {
    return a.playlist_id
  })

  const handleEndReached = useCallback(() => {
    if (isReachable && hasMore) {
      fetchMore()
    }
  }, [isReachable, hasMore, fetchMore])

  const loadingSpinner = <LoadingMoreSpinner />

  let content: ReactNode
  if (!statusIsNotFinalized(status) && !fetchedAlbums.length && !filterValue) {
    if (isReachable) {
      content = <EmptyTileCTA message={messages.emptyTabText} />
    } else {
      content = <NoTracksPlaceholder />
    }
  } else {
    content = (
      <>
        <OfflineContentBanner />
        <FilterInput
          value={filterValue}
          placeholder={messages.inputPlaceholder}
          onChangeText={setFilterValue}
        />
        <CollectionList
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          scrollEnabled={false}
          collectionIds={albumsIds}
          ListFooterComponent={
            statusIsNotFinalized(status) && isReachable ? loadingSpinner : null
          }
        />
      </>
    )
  }

  return <VirtualizedScrollView>{content}</VirtualizedScrollView>
}
