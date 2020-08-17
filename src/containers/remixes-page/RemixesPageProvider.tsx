import React, { useEffect, useCallback } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { push as pushRoute } from 'connected-react-router'

import { getTrack, getUser, getLineup, getCount } from './store/selectors'
import { tracksActions } from './store/lineups/tracks/actions'

import { makeGetLineupMetadatas } from 'store/lineup/selectors'
import { AppState } from 'store/types'
import { RemixesPageProps as MobileRemixesPageProps } from './components/mobile/RemixesPage'
import { RemixesPageProps as DesktopRemixesPageProps } from './components/desktop/RemixesPage'
import { ID } from 'models/common/Identifiers'
import { useTrackIdFromUrl } from './hooks'
import { makeGetCurrent } from 'store/queue/selectors'
import { getPlaying, getBuffering } from 'store/player/selectors'
import { fetchTrack, reset } from './store/slice'
import { trackPage, profilePage } from 'utils/route'
import { LineupVariant } from 'containers/lineup/types'

const messages = {
  title: 'Remixes',
  description: 'Remixes'
}

type OwnProps = {
  containerRef: React.RefObject<HTMLDivElement>
  children:
    | React.ComponentType<DesktopRemixesPageProps>
    | React.ComponentType<MobileRemixesPageProps>
}

type mapStateProps = ReturnType<typeof makeMapStateToProps>
type RemixesPageProviderProps = OwnProps &
  ReturnType<mapStateProps> &
  ReturnType<typeof mapDispatchToProps>

const RemixesPageProvider = ({
  containerRef,
  children: Children,
  count,
  originalTrack,
  user,
  tracks,
  fetchTrack,
  currentQueueItem,
  isPlaying,
  isBuffering,
  pause,
  play,
  loadMore,
  goToRoute,
  reset,
  resetTracks
}: RemixesPageProviderProps) => {
  const trackId = useTrackIdFromUrl()
  useEffect(() => {
    if (trackId) {
      fetchTrack(trackId)
    }
  }, [trackId, fetchTrack])

  useEffect(() => {
    return function cleanup() {
      reset()
      resetTracks()
    }
  }, [reset, resetTracks])

  const goToTrackPage = useCallback(() => {
    goToRoute(
      trackPage(user?.handle, originalTrack?.title, originalTrack?.track_id)
    )
  }, [goToRoute, originalTrack, user])

  const goToArtistPage = useCallback(() => {
    goToRoute(profilePage(user?.handle))
  }, [goToRoute, user])

  const getLineupProps = () => {
    return {
      selfLoad: true,
      variant: LineupVariant.MAIN,
      containerRef,
      lineup: tracks,
      playingUid: currentQueueItem.uid,
      playingSource: currentQueueItem.source,
      playingTrackId: currentQueueItem.track && currentQueueItem.track.track_id,
      playing: isPlaying,
      buffering: isBuffering,
      pauseTrack: pause,
      playTrack: play,
      actions: tracksActions,
      scrollParent: containerRef as any,
      loadMore: (offset: number, limit: number) => {
        loadMore(offset, limit, { trackId })
      }
    }
  }

  const childProps = {
    title: messages.title,
    count,
    originalTrack,
    user,
    goToTrackPage,
    goToArtistPage,
    getLineupProps
  }

  return <Children {...childProps} />
}

function makeMapStateToProps() {
  const getRemixesTracksLineup = makeGetLineupMetadatas(getLineup)
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state: AppState) => {
    return {
      user: getUser(state),
      originalTrack: getTrack(state),
      count: getCount(state),
      tracks: getRemixesTracksLineup(state),
      currentQueueItem: getCurrentQueueItem(state),
      isPlaying: getPlaying(state),
      isBuffering: getBuffering(state)
    }
  }
  return mapStateToProps
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    fetchTrack: (trackId: ID) => dispatch(fetchTrack({ trackId })),
    loadMore: (
      offset: number,
      limit: number,
      payload: { trackId: ID | null }
    ) =>
      dispatch(
        tracksActions.fetchLineupMetadatas(offset, limit, false, payload)
      ),
    pause: () => dispatch(tracksActions.pause()),
    play: (uid?: string) => dispatch(tracksActions.play(uid)),
    reset: () => dispatch(reset()),
    resetTracks: () => dispatch(tracksActions.reset())
  }
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(RemixesPageProvider)
