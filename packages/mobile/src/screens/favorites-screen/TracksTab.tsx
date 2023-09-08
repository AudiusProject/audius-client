import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ID, Nullable, Track, UID, User } from '@audius/common'
import {
  LibraryCategory,
  SavedPageTabs,
  FavoriteSource,
  PlaybackSource,
  Status,
  cacheTracksSelectors,
  cacheUsersSelectors,
  reachabilitySelectors,
  savedPageActions,
  savedPageSelectors,
  savedPageTracksLineupActions as tracksActions,
  tracksSocialActions
} from '@audius/common'
import { debounce, isEqual } from 'lodash'
import Animated, { Layout } from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'

import { Tile, VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { TrackList } from 'app/components/track-list'
import type { TrackMetadata } from 'app/components/track-list/types'
import { WithLoader } from 'app/components/with-loader/WithLoader'
import { makeStyles } from 'app/styles'

import { FilterInput } from './FilterInput'
import { LoadingMoreSpinner } from './LoadingMoreSpinner'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
import { useFavoritesLineup } from './useFavoritesLineup'

const { saveTrack, unsaveTrack } = tracksSocialActions
const { fetchSaves: fetchSavesAction, fetchMoreSaves } = savedPageActions
const {
  getTrackSaves,
  getSavedTracksStatus,
  getInitialFetchStatus,
  getSelectedCategoryLocalAdds,
  getIsFetchingMore,
  getCategory
} = savedPageSelectors
const { getIsReachable } = reachabilitySelectors
const { getTrack } = cacheTracksSelectors
const { getUserFromTrack } = cacheUsersSelectors

const messages = {
  emptyTracksFavoritesText: "You haven't favorited any tracks yet.",
  emptyTracksRepostsText: "You haven't reposted any tracks yet.",
  emptyTracksPurchasedText: "You haven't purchased any tracks yet.",
  emptyTracksAllText:
    "You haven't favorited, reposted, or purchased any tracks yet.",
  inputPlaceholder: 'Filter Tracks'
}

const useStyles = makeStyles(({ spacing }) => ({
  container: {
    marginBottom: spacing(4),
    marginHorizontal: spacing(3)
  },
  trackList: {
    borderRadius: 8,
    overflow: 'hidden'
  },
  spinnerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing(12)
  }
}))

const FETCH_LIMIT = 50

export const TracksTab = () => {
  const dispatch = useDispatch()
  const styles = useStyles()
  const isReachable = useSelector(getIsReachable)

  const [filterValue, setFilterValue] = useState('')
  const [fetchPage, setFetchPage] = useState(0)
  const selectedCategory = useSelector((state) =>
    getCategory(state, { currentTab: SavedPageTabs.TRACKS })
  )
  const savedTracksStatus = useSelector(getSavedTracksStatus)
  const initialFetch = useSelector(getInitialFetchStatus)
  const isFetchingMore = useSelector(getIsFetchingMore)
  const saves = useSelector(getTrackSaves)
  const localAdditions = useSelector(getSelectedCategoryLocalAdds)

  const saveCount = useMemo(
    () => saves.length + Object.keys(localAdditions).length,
    [saves, localAdditions]
  )

  const isLoading = savedTracksStatus !== Status.SUCCESS

  let emptyTabText: string
  if (selectedCategory === LibraryCategory.All) {
    emptyTabText = messages.emptyTracksAllText
  } else if (selectedCategory === LibraryCategory.Favorite) {
    emptyTabText = messages.emptyTracksFavoritesText
  } else if (selectedCategory === LibraryCategory.Repost) {
    emptyTabText = messages.emptyTracksRepostsText
  } else {
    emptyTabText = messages.emptyTracksPurchasedText
  }

  const fetchSaves = useCallback(() => {
    dispatch(
      fetchSavesAction(filterValue, selectedCategory, '', '', 0, FETCH_LIMIT)
    )
  }, [dispatch, filterValue, selectedCategory])

  useEffect(() => {
    // Need to fetch saves when the filterValue or selectedCategory (by way of fetchSaves) changes
    if (isReachable) {
      fetchSaves()
    }
  }, [isReachable, fetchSaves])

  const { entries } = useFavoritesLineup(fetchSaves)
  const trackUids = useMemo(() => entries.map(({ uid }) => uid), [entries])

  const filterTrack = (
    track: Nullable<Track>,
    user: Nullable<User>
  ): track is TrackMetadata => {
    if (!track || !user) {
      return false
    }

    if (!filterValue.length) {
      return true
    }

    const matchValue = filterValue?.toLowerCase()
    return (
      track.title?.toLowerCase().indexOf(matchValue) > -1 ||
      user.name.toLowerCase().indexOf(matchValue) > -1
    )
  }

  const allTracksFetched = useMemo(() => {
    return trackUids.length === saveCount && !filterValue
  }, [trackUids, saveCount, filterValue])

  const handleMoreFetchSaves = useCallback(() => {
    if (
      allTracksFetched ||
      isFetchingMore ||
      !isReachable ||
      trackUids.length < fetchPage * FETCH_LIMIT
    ) {
      return
    }

    const nextPage = fetchPage + 1
    dispatch(
      fetchMoreSaves(
        filterValue,
        selectedCategory,
        '',
        '',
        nextPage * FETCH_LIMIT,
        FETCH_LIMIT
      )
    )
    setFetchPage(nextPage)
  }, [
    allTracksFetched,
    selectedCategory,
    dispatch,
    fetchPage,
    filterValue,
    isFetchingMore,
    isReachable,
    trackUids.length
  ])

  const filteredTrackUids: string[] = useSelector((state) => {
    return trackUids.filter((uid) => {
      const track = getTrack(state, { uid })
      const user = getUserFromTrack(state, { uid })
      return filterTrack(track, user)
    })
  }, isEqual)

  const onToggleSave = useCallback(
    (isSaved: boolean, trackId: ID) => {
      if (trackId === undefined) return
      const action = isSaved ? unsaveTrack : saveTrack
      dispatch(action(trackId, FavoriteSource.LIBRARY_PAGE))
    },
    [dispatch]
  )

  const togglePlay = useCallback(
    (uid: UID, id: ID) => {
      dispatch(tracksActions.togglePlay(uid, id, PlaybackSource.LIBRARY_PAGE))
    },
    [dispatch]
  )

  const handleChangeFilterValue = useMemo(() => {
    return debounce(setFilterValue, 250)
  }, [])

  const loadingSpinner = <LoadingMoreSpinner />

  return (
    <VirtualizedScrollView>
      {!isLoading && filteredTrackUids.length === 0 && !filterValue ? (
        !isReachable ? (
          <NoTracksPlaceholder />
        ) : (
          <EmptyTileCTA message={emptyTabText} />
        )
      ) : (
        <>
          <OfflineContentBanner />
          <FilterInput
            placeholder={messages.inputPlaceholder}
            onChangeText={handleChangeFilterValue}
          />
          <WithLoader loading={initialFetch}>
            <Animated.View layout={Layout}>
              {filteredTrackUids.length ? (
                <Tile
                  styles={{
                    tile: styles.container
                  }}
                >
                  <TrackList
                    style={styles.trackList}
                    hideArt
                    onEndReached={handleMoreFetchSaves}
                    onEndReachedThreshold={1.5}
                    onSave={onToggleSave}
                    showDivider
                    togglePlay={togglePlay}
                    trackItemAction='save'
                    uids={filteredTrackUids}
                  />
                </Tile>
              ) : null}
              {isFetchingMore ? loadingSpinner : null}
            </Animated.View>
          </WithLoader>
        </>
      )}
    </VirtualizedScrollView>
  )
}
