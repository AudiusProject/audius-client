import { useCallback, useEffect, useMemo, useState } from 'react'

import type { ID, Nullable, Track, UID, User } from '@audius/common'
import {
  cacheTracksSelectors,
  cacheUsersSelectors,
  savedPageActions,
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
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

import { FilterInput } from './FilterInput'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
import { useFavoritesLineup } from './useFavoritesLineup'
const { saveTrack, unsaveTrack } = tracksSocialActions
const { fetchSaves: fetchSavesAction, fetchMoreSaves } = savedPageActions
const {
  getSaves,
  getLocalSaves,
  getSavedTracksStatus,
  getInitialFetchStatus,
  getIsFetchingMore
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
  const savedTracksStatus = useSelector(getSavedTracksStatus)
  const initialFetch = useSelector(getInitialFetchStatus)
  const isFetchingMore = useSelector(getIsFetchingMore)
  const saves = useSelector(getSaves)
  const localSaves = useSelector(getLocalSaves)

  const saveCount = useMemo(
    () => saves.length + Object.keys(localSaves).length,
    [saves, localSaves]
  )

  const isLoading = savedTracksStatus !== Status.SUCCESS

  const fetchSaves = useCallback(() => {
    dispatch(fetchSavesAction(filterValue, '', '', 0, FETCH_LIMIT))
  }, [dispatch, filterValue])

  useEffect(() => {
    // Need to fetch saves when the filterValue (by way of fetchSaves) changes
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
      (isOfflineModeEnabled && !isReachable) ||
      trackUids.length < fetchPage * FETCH_LIMIT
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
    isOfflineModeEnabled,
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

  const handleChangeFilterValue = useMemo(() => {
    return debounce(setFilterValue, 250)
  }, [])

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
            placeholder={messages.inputPlaceholder}
            onChangeText={handleChangeFilterValue}
          />
          <WithLoader loading={initialFetch}>
            <>
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
