import type { CommonState } from '@audius/common'
import {
  Status,
  searchResultsPageSelectors,
  useProxySelector,
  SearchKind
} from '@audius/common'

import { CollectionList } from 'app/components/collection-list/CollectionList'

import { EmptyResults } from '../EmptyResults'

import { useFetchTabResultsEffect } from './useFetchTabResultsEffect'

const { getSearchStatus } = searchResultsPageSelectors

const selectSearchAlbums = (state: CommonState) => {
  const searchStatus = getSearchStatus(state)
  if (searchStatus === Status.LOADING) return undefined

  return state.pages.searchResults.albumIds
    ?.map((albumId) => {
      const album = state.collections.entries[albumId].metadata
      const user = state.users.entries[album.playlist_owner_id].metadata
      const trackCount = album.playlist_contents.track_ids.length
      return { ...album, user, trackCount }
    })
    .filter((album) => album.user && !album.user.is_deactivated)
}

export const AlbumsTab = () => {
  const albums = useProxySelector(selectSearchAlbums, [])
  useFetchTabResultsEffect(SearchKind.ALBUMS)

  return (
    <CollectionList
      isLoading={!albums}
      collection={albums}
      ListEmptyComponent={<EmptyResults />}
    />
  )
}
