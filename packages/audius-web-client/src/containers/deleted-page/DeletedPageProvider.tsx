import React, { useEffect, useCallback } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { push as pushRoute } from 'connected-react-router'

import { getLineup } from './store/selectors'
import { moreByActions } from './store/lineups/more-by/actions'

import { makeGetLineupMetadatas } from 'store/lineup/selectors'
import { AppState } from 'store/types'
import { DeletedPageProps as MobileDeletedPageProps } from './components/mobile/DeletedPage'
import { DeletedPageProps as DesktopDeletedPageProps } from './components/desktop/DeletedPage'
import { ID } from 'models/common/Identifiers'
import { makeGetCurrent } from 'store/queue/selectors'
import { getPlaying, getBuffering } from 'store/player/selectors'
import { profilePage } from 'utils/route'
import { LineupVariant } from 'containers/lineup/types'
import User from 'models/User'
import Playable from 'models/Playable'

type OwnProps = {
  title: string
  description: string
  canonicalUrl: string
  user: User | null
  playable: Playable

  children:
    | React.ComponentType<DesktopDeletedPageProps>
    | React.ComponentType<MobileDeletedPageProps>
}

type mapStateProps = ReturnType<typeof makeMapStateToProps>
type DeletedPageProviderProps = OwnProps &
  ReturnType<mapStateProps> &
  ReturnType<typeof mapDispatchToProps>

const DeletedPageProvider = ({
  title,
  description,
  canonicalUrl,
  user,
  playable,
  children: Children,
  currentQueueItem,
  isPlaying,
  isBuffering,
  pause,
  play,
  loadMore,
  goToRoute,
  resetTracks,
  moreBy
}: DeletedPageProviderProps) => {
  useEffect(() => {
    return function cleanup() {
      resetTracks()
    }
  }, [resetTracks])

  const goToArtistPage = useCallback(() => {
    goToRoute(profilePage(user?.handle))
  }, [goToRoute, user])

  const getLineupProps = () => {
    return {
      selfLoad: true,
      variant: LineupVariant.CONDENSED,
      lineup: moreBy,
      count: 5,
      playingUid: currentQueueItem.uid,
      playingSource: currentQueueItem.source,
      playingTrackId: currentQueueItem.track && currentQueueItem.track.track_id,
      playing: isPlaying,
      buffering: isBuffering,
      pauseTrack: pause,
      playTrack: play,
      actions: moreByActions,
      loadMore: (offset: number, limit: number) => {
        loadMore(offset, limit, { userId: user?.user_id ?? null })
      }
    }
  }

  const childProps = {
    title,
    description,
    canonicalUrl,
    playable,
    user,
    goToArtistPage,
    getLineupProps
  }

  return <Children {...childProps} />
}

function makeMapStateToProps() {
  const getMoreByLineup = makeGetLineupMetadatas(getLineup)
  const getCurrentQueueItem = makeGetCurrent()

  const mapStateToProps = (state: AppState) => {
    return {
      moreBy: getMoreByLineup(state),
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
    loadMore: (offset: number, limit: number, payload: { userId: ID | null }) =>
      dispatch(
        moreByActions.fetchLineupMetadatas(offset, limit, false, payload)
      ),
    pause: () => dispatch(moreByActions.pause()),
    play: (uid?: string) => dispatch(moreByActions.play(uid)),
    resetTracks: () => dispatch(moreByActions.reset())
  }
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(DeletedPageProvider)
