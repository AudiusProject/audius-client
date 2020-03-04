import { h } from 'preact'
import { useState, useContext, useCallback, useEffect } from 'preact/hooks'

import { PlayerFlavor } from '../app'
import TrackPlayerCompact from './TrackPlayerCompact'
import usePlayback from '../../hooks/usePlayback'
import { PauseContext } from '../pausedpopover/PauseProvider'
import TrackPlayerCard from './TrackPlayerCard'
import { useSpacebar } from '../../hooks/useSpacebar'
import { useRecordListens } from '../../hooks/useRecordListens'
import { PlayingState } from '../playbutton/PlayButton'
import { isMobile } from '../../util/isMobile'

const LISTEN_INTERVAL_SECONDS = 1

const TrackPlayerContainer = ({
  flavor,
  track,
  isTwitter,
  backgroundColor,
}) => {
  const [didInitAudio, setDidInitAudio] = useState(false)
  const { popoverVisibility, setPopoverVisibility } = useContext(PauseContext)

  const onTrackEnd = useCallback(() => {
    setPopoverVisibility(true)
  }, [setPopoverVisibility])

  const {
    playingState,
    duration,
    position,
    loadTrack,
    mediaKey,
    seekTo,
    onTogglePlay,
    initAudio,
  } = usePlayback(track.id, onTrackEnd)

  const didTogglePlay = useCallback(() => {
    if (!didInitAudio) {
      initAudio()
      loadTrack(track.segments)
      setDidInitAudio(true)
    }
    onTogglePlay()
    if (playingState === PlayingState.Playing) {
      setPopoverVisibility(true)
    }
  }, [didInitAudio, initAudio, loadTrack, setDidInitAudio, onTogglePlay, playingState, setPopoverVisibility])

  const playbarEnabled = playingState !== PlayingState.Buffering && !popoverVisibility
  useSpacebar(didTogglePlay, playbarEnabled)

  useRecordListens(position, mediaKey, track.id, LISTEN_INTERVAL_SECONDS)

  // Setup autoplay on twitter
  useEffect(() => {
    const mobile = isMobile()
    if (!isTwitter || mobile) return
    initAudio()
    loadTrack(track.segments)
    setDidInitAudio(true)
    onTogglePlay()
  }, [])

  const props = {
    title: track.title,
    mediaKey,
    handle: track.handle,
    artistName: track.userName,
    playingState,
    albumArtURL: track.coverArt,
    onTogglePlay: didTogglePlay,
    isVerified: track.isVerified,
    seekTo,
    position,
    duration,
    trackURL: track.urlPath,
    backgroundColor,
    isTwitter,
  }

  if (flavor === PlayerFlavor.COMPACT) {
    return (
      <TrackPlayerCompact
        {...props}
      />
    )
  }

  return (
    <TrackPlayerCard
      {...props}
    />
  )
}

export default TrackPlayerContainer
