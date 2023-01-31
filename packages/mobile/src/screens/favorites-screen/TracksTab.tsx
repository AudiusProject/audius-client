import { useCallback, useState } from 'react'

import type { ID, Nullable, Track, UID, User } from '@audius/common'
import {
  cacheTracksSelectors,
  cacheUsersSelectors,
  savedPageActions,
  playerSelectors,
  Status,
  FavoriteSource,
  Name,
  PlaybackSource,
  savedPageTracksLineupActions as tracksActions,
  savedPageSelectors,
  tracksSocialActions,
  reachabilitySelectors
} from '@audius/common'
import { useFocusEffect } from '@react-navigation/native'
import { isEqual } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

import { Tile, VirtualizedScrollView } from 'app/components/core'
import { EmptyTileCTA } from 'app/components/empty-tile-cta'
import { TrackList } from 'app/components/track-list'
import type { TrackMetadata } from 'app/components/track-list/types'
import { WithLoader } from 'app/components/with-loader/WithLoader'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useOfflineCollectionLineup } from 'app/hooks/useLoadOfflineTracks'
import { make, track } from 'app/services/analytics'
import { DOWNLOAD_REASON_FAVORITES } from 'app/services/offline-downloader'
import { makeStyles } from 'app/styles'

import { FilterInput } from './FilterInput'
import { NoTracksPlaceholder } from './NoTracksPlaceholder'
import { OfflineContentBanner } from './OfflineContentBanner'
const { getPlaying, getUid } = playerSelectors
const { saveTrack, unsaveTrack } = tracksSocialActions
const { getSavedTracksLineup, getSavedTracksStatus } = savedPageSelectors
const { fetchSaves } = savedPageActions
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

export const TracksTab = () => {
  const dispatch = useDispatch()
  const styles = useStyles()
  const isReachable = useSelector(getIsReachable)
  const isOfflineModeEnabled = useIsOfflineModeEnabled()

  const handleFetchSavesOnline = useCallback(() => {
    dispatch(fetchSaves())
  }, [dispatch])

  useOfflineCollectionLineup(
    DOWNLOAD_REASON_FAVORITES,
    handleFetchSavesOnline,
    tracksActions
  )

  const [filterValue, setFilterValue] = useState('')
  const isPlaying = useSelector(getPlaying)
  const playingUid = useSelector(getUid)
  const savedTracksStatus = useSelector(getSavedTracksStatus)
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

  const filteredTrackUids: string[] = useSelector(
    (state) => {
      return savedTrackUids.filter((uid) => {
        const track = getTrack(state, { uid })
        const user = getUserFromTrack(state, { uid })
        return filterTrack(track, user)
      })
    },
    isEqual
  )

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
      if (uid !== playingUid || (uid === playingUid && !isPlaying)) {
        dispatch(tracksActions.play(uid))
        // TODO: store and queue events locally; upload on reconnect
        if (!isReachable && isOfflineModeEnabled) return
        track(
          make({
            eventName: Name.PLAYBACK_PLAY,
            id: `${id}`,
            source: PlaybackSource.FAVORITES_PAGE
          })
        )
      } else if (uid === playingUid && isPlaying) {
        dispatch(tracksActions.pause())
        if (!isReachable && isOfflineModeEnabled) return
        track(
          make({
            eventName: Name.PLAYBACK_PAUSE,
            id: `${id}`,
            source: PlaybackSource.FAVORITES_PAGE
          })
        )
      }
    },
    [playingUid, isPlaying, dispatch, isReachable, isOfflineModeEnabled]
  )

  const isLoading = savedTracksStatus !== Status.SUCCESS
  const hasNoFavorites = savedTrackUids.length === 0

  return (
    <WithLoader loading={isLoading}>
      <VirtualizedScrollView listKey='favorites-screen'>
        {!isLoading && hasNoFavorites && !filterValue ? (
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
                  hideArt
                />
              </Tile>
            ) : null}
          </>
        )}
      </VirtualizedScrollView>
    </WithLoader>
  )
}
