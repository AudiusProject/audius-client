import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ID, Nullable, Track, UID, User } from '@audius/common'
import {
  cacheTracksSelectors,
  cacheUsersSelectors,
  savedPageActions,
  playerSelectors,
  Status,
  FavoriteSource,
  PlaybackSource,
  savedPageTracksLineupActions as tracksActions,
  savedPageSelectors,
  tracksSocialActions,
  reachabilitySelectors
} from '@audius/common'
import { isEqual, debounce } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import { Tile, VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import LoadingSpinner from 'app/components/loading-spinner'
import { TrackList } from 'app/components/track-list'
import type { TrackMetadata } from 'app/components/track-list/types'
import { WithLoader } from 'app/components/with-loader/WithLoader'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useOfflineCollectionLineup } from 'app/hooks/useLoadOfflineTracks'
import { DOWNLOAD_REASON_FAVORITES } from 'app/services/offline-downloader'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

import { FilterInput } from './FilterInput'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
const { saveTrack, unsaveTrack } = tracksSocialActions
const { fetchSaves, fetchMoreSaves } = savedPageActions
const {
  getSavedTracksLineup,
  getSavedTracksStatus,
  getInitialFetchStatus,
  getIsFetchingMore,
  hasReachedEnd
} = savedPageSelectors
const { getIsReachable } = reachabilitySelectors
const { getTrack } = cacheTracksSelectors
const { getUserFromTrack } = cacheUsersSelectors

const messages = {
  emptyTabText: "You haven't favorited any tracks yet.",
  inputPlaceholder: 'Filter Tracks'
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  container: {
    marginVertical: spacing(4),
    marginHorizontal: spacing(3),
    borderRadius: 6
  },
  trackListContainer: {
    backgroundColor: palette.white,
    borderRadius: 6,
    overflow: 'hidden'
  },
  spinnerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 48
  }
}))

const FETCH_LIMIT = 50

export const TracksTab = () => {
  const dispatch = useDispatch()
  const styles = useStyles()
  const isReachable = useSelector(getIsReachable)
  const isOfflineModeEnabled = useIsOfflineModeEnabled()

  const [filterValue, setFilterValue] = useState('')
  const [fetchPage, setFetchPage] = useState(0)
  const [allTracksFetched, setAllTracksFetched] = useState(false)
  const savedTracksStatus = useSelector(getSavedTracksStatus)
  const hasReachedFavoritesEnd = useSelector(hasReachedEnd)
  const initialFetch = useSelector(getInitialFetchStatus)
  const isFetchingMore = useSelector(getIsFetchingMore)

  const isLoading = savedTracksStatus !== Status.SUCCESS

  const debouncedFetchSavesOnline = useMemo(() => {
    return debounce((filterVal) => {
      dispatch(fetchSaves(filterVal, '', '', 0, FETCH_LIMIT))
    }, 500)
  }, [dispatch])

  useOfflineCollectionLineup(
    DOWNLOAD_REASON_FAVORITES,
    debouncedFetchSavesOnline as any,
    tracksActions
  )

  const savedTrackUids: string[] = useSelector(
    (state) => getSavedTracksLineup(state).entries.map(({ uid }) => uid),
    isEqual
  )
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

  const handleMoreFetchSaves = useCallback(() => {
    if (
      allTracksFetched ||
      isLoading ||
      isFetchingMore ||
      (isOfflineModeEnabled && !isReachable) ||
      savedTrackUids.length < fetchPage * FETCH_LIMIT
    ) {
      return
    }

    const nextPage = fetchPage + 1
    dispatch(
      fetchMoreSaves(filterValue, '', '', nextPage * FETCH_LIMIT, FETCH_LIMIT)
    )
    setFetchPage(nextPage)
  }, [
    allTracksFetched,
    dispatch,
    fetchPage,
    filterValue,
    isFetchingMore,
    isLoading,
    isOfflineModeEnabled,
    isReachable,
    savedTrackUids.length
  ])

  useEffect(() => {
    if (savedTrackUids && !allTracksFetched && !filterValue) {
      setAllTracksFetched(true)
    } else if (!savedTrackUids && allTracksFetched) {
      setAllTracksFetched(false)
    }
  }, [allTracksFetched, filterValue, hasReachedFavoritesEnd, savedTrackUids])

  const filteredTrackUids: string[] = useSelector((state) => {
    return savedTrackUids.filter((uid) => {
      const track = getTrack(state, { uid })
      const user = getUserFromTrack(state, { uid })
      return filterTrack(track, user)
    })
  }, isEqual)

  const onToggleSave = useCallback(
    (isSaved: boolean, trackId: ID) => {
      if (trackId === undefined) return
      const action = isSaved ? unsaveTrack : saveTrack
      dispatch(action(trackId, FavoriteSource.FAVORITES_PAGE))
    },
    [dispatch]
  )

  const togglePlay = useCallback(
    (uid: UID, id: ID) => {
      dispatch(tracksActions.togglePlay(uid, id, PlaybackSource.FAVORITES_PAGE))
    },
    [dispatch]
  )

  return (
    <VirtualizedScrollView listKey='favorites-screen'>
      {!isLoading && filteredTrackUids.length === 0 && !filterValue ? (
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
          <WithLoader loading={initialFetch}>
            <>
              {filteredTrackUids.length ? (
                <Tile
                  styles={{
                    root: styles.container,
                    tile: styles.trackListContainer
                  }}
                >
                  <TrackList
                    onSave={onToggleSave}
                    showDivider
                    togglePlay={togglePlay}
                    trackItemAction='save'
                    uids={filteredTrackUids}
                    onEndReachedThreshold={1.5}
                    onEndReached={handleMoreFetchSaves}
                    hideArt
                  />
                </Tile>
              ) : null}
              {isFetchingMore ? (
                <LoadingSpinner
                  style={{
                    alignSelf: 'center',
                    marginTop: spacing(1),
                    marginBottom: spacing(8)
                  }}
                />
              ) : null}
            </>
          </WithLoader>
        </>
      )}
    </VirtualizedScrollView>
  )
}
