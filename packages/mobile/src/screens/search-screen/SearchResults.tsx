import { getSearch } from 'audius-client/src/common/store/search-bar/selectors'
import { Keyboard } from 'react-native'
import { useSelector } from 'react-redux'

import { Divider, SectionList } from 'app/components/core'
import type { AppState } from 'app/store'

import { SearchItem } from './SearchItem'
import type { SearchResultItem } from './SearchItem/SearchItem'
import type { SectionHeader } from './SearchSectionHeader'
import { SearchSectionHeader } from './SearchSectionHeader'
import { SeeMoreResultsButton } from './SeeMoreResultsButton'

type SearchResultSection = {
  title: SectionHeader
  data: SearchResultItem[]
}

const selectSearchResultsSections = (state: AppState) => {
  const { tracks, users, playlists, albums } = getSearch(state)

  return [
    { title: 'tracks' as const, data: tracks },
    { title: 'users' as const, data: users },
    { title: 'playlists' as const, data: playlists },
    { title: 'albums' as const, data: albums }
  ].filter((section) => section.data.length > 0)
}

export const SearchResults = () => {
  const searchResultsSections = useSelector(selectSearchResultsSections)

  return (
    <SectionList<SearchResultItem, SearchResultSection>
      onTouchStart={Keyboard.dismiss}
      keyboardShouldPersistTaps='always'
      stickySectionHeadersEnabled={false}
      sections={searchResultsSections}
      keyExtractor={(item) => {
        if ('track_id' in item) return `track-${item.track_id}`
        else if ('user_id' in item) return `user-${item.user_id}`
        return `playlist-${item.playlist_id}`
      }}
      renderItem={({ section: { title }, item }) => (
        <SearchItem type={title} item={item} />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <SearchSectionHeader title={title} />
      )}
      ItemSeparatorComponent={Divider}
      ListFooterComponent={<SeeMoreResultsButton />}
    />
  )
}
