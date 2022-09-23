import {
  lineupSelectors,
  SearchKind,
  searchResultsPageSelectors,
  searchResultsPageTracksLineupActions as tracksActions
} from '@audius/common'
import { useSelector } from 'react-redux'

import { Lineup } from 'app/components/lineup'

import { SearchResultsTab } from './SearchResultsTab'
import { useFetchTabResultsEffect } from './useFetchTabResultsEffect'
const { getSearchTracksLineup } = searchResultsPageSelectors

export const TracksTab = () => {
  const lineup = useSelector(getSearchTracksLineupMetadatas)
  const dispatch = useDispatch()
  const { query, isTagSearch } = useContext(SearchQueryContext)
  const loadMore = useCallback(
    (offset: number, limit: number) => {
      dispatch(
        tracksActions.fetchLineupMetadatas(offset, limit, false, {
          category: SearchKind.TRACKS,
          query,
          isTagSearch
        })
      )
    },
    [dispatch, isTagSearch, query]
  )

  useFetchTabResultsEffect(SearchKind.TRACKS)
  return (
    <SearchResultsTab
      noResults={lineup?.entries.length === 0}
      status={lineup?.status}
    >
      <Lineup actions={tracksActions} lineup={lineup} />
    </SearchResultsTab>
  )
}
