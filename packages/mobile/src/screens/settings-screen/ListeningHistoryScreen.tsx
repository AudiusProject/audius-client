import { useCallback } from 'react'

import { Name, PlaybackSource } from 'audius-client/src/common/models/Analytics'
import { ID, UID } from 'audius-client/src/common/models/Identifiers'
import { LineupState } from 'audius-client/src/common/models/Lineup'
import Status from 'audius-client/src/common/models/Status'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import { CommonState } from 'audius-client/src/common/store'
import { getTracks } from 'audius-client/src/common/store/cache/tracks/selectors'
import { getUsers } from 'audius-client/src/common/store/cache/users/selectors'
import { tracksActions } from 'audius-client/src/common/store/pages/history-page/lineups/tracks/actions'
import { getHistoryTracksLineup } from 'audius-client/src/common/store/pages/history-page/selectors'
import { View } from 'react-native'
import { shallowEqual, useSelector } from 'react-redux'

import { Screen, Tile, VirtualizedScrollView } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { TrackList } from 'app/components/track-list'
import { ListTrackMetadata } from 'app/components/track-list/types'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { getPlaying, getPlayingUid } from 'app/store/audio/selectors'
import { makeStyles } from 'app/styles'
import { make, track } from 'app/utils/analytics'

const messages = {
  title: 'Listening History'
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

export const ListeningHistoryScreen = () => {
  const styles = useStyles()
  const dispatchWeb = useDispatchWeb()
  const isPlaying = useSelector(getPlaying)
  const playingUid = useSelector(getPlayingUid)
  const historyTracks: LineupState<Track> = useSelectorWeb(
    getHistoryTracksLineup
  )

  const status = historyTracks.status

  const trackIds = historyTracks.entries.map(e => e.id)
  const tracks = useSelectorWeb(
    (state: CommonState) => getTracks(state, { ids: trackIds }),
    shallowEqual
  ) as { [id: number]: Track }

  const creatorIds = Object.values(tracks).map(t => t.owner_id)
  const artists = useSelectorWeb(
    (state: CommonState) => getUsers(state, { ids: creatorIds }),
    shallowEqual
  ) as { [id: number]: User }

  const tracksWithUsers = Object.values(tracks).map(track => ({
    ...track,
    uid: historyTracks.entries.find(t => t.id === track.track_id)?.uid,
    user: artists[track.owner_id]
  }))

  const isQueued = () => {
    return tracksWithUsers.some((track: any) => playingUid === track.uid)
  }

  const queuedAndPlaying = isPlaying && isQueued

  const trackList: ListTrackMetadata[] = tracksWithUsers
    .map(track => ({
      isLoading: false,
      isSaved: track.has_current_user_saved,
      isReposted: track.has_current_user_reposted,
      isActive: playingUid === track.uid,
      isPlaying: queuedAndPlaying && playingUid === track.uid,
      artistName: track.user.name,
      artistHandle: track.user.handle,
      trackTitle: track.title,
      trackId: track.track_id,
      has_current_user_reposted: track.has_current_user_reposted,
      has_current_user_saved: track.has_current_user_saved,
      coverArtSizes: track._cover_art_sizes,
      uid: track.uid,
      isDeleted: track.is_delete || !!track.user.is_deactivated,
      user: track.user
    }))
    .reverse()

  const togglePlay = useCallback(
    (uid: UID, id: ID) => {
      if (uid !== playingUid || (uid === playingUid && !isPlaying)) {
        dispatchWeb(tracksActions.play(uid))
        track(
          make({
            eventName: Name.PLAYBACK_PLAY,
            id: `${id}`,
            source: PlaybackSource.HISTORY_PAGE
          })
        )
      } else if (uid === playingUid && isPlaying) {
        dispatchWeb(tracksActions.pause())
        track(
          make({
            eventName: Name.PLAYBACK_PAUSE,
            id: `${id}`,
            source: PlaybackSource.HISTORY_PAGE
          })
        )
      }
    },
    [dispatchWeb, isPlaying, playingUid]
  )

  // TODO: Use the dot spinner
  if (status === Status.LOADING) {
    return (
      <View style={styles.spinnerContainer}>
        <LoadingSpinner />
      </View>
    )
  }

  return (
    <Screen title={messages.title} topbarRight={null} variant='secondary'>
      <VirtualizedScrollView listKey='listening-history-screen'>
        <Tile
          styles={{
            root: styles.container,
            tile: styles.trackListContainer
          }}
        >
          <TrackList
            tracks={trackList ?? []}
            showDivider
            togglePlay={togglePlay}
            trackItemAction='overflow'
          />
        </Tile>
      </VirtualizedScrollView>
    </Screen>
  )
}
