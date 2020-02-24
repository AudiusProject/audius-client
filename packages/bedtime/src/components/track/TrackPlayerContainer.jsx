import { h } from 'preact'
import { useState, useContext, useEffect } from 'preact/hooks'

import { PlayerFlavor } from '../app'
import TrackPlayerCompact from './TrackPlayerCompact'
import usePlayback from '../../hooks/usePlayback'
import { PauseContext } from '../pausedpopover/PauseProvider'
import TrackPlayerCard from './TrackPlayerCard'
import { useSpacebar } from '../../hooks/useSpacebar'
import { useRecordListens } from '../../hooks/useRecordListens'
import { getDominantColor } from '../../util/image/dominantColor'
import { PlayingState } from '../playbutton/PlayButton'

// TODO: props
// interface TrackPlayerContainerProps {
//   flavor: PlayerFlavor
//   track: GetTracksResponse
// }

const LISTEN_INTERVAL_SECONDS = 1

const TrackPlayerContainer = ({
  flavor,
  track,
  isTwitter
}) => {
  const [backgroundColor, setBackgroundColor] = useState('')
  const [didInitAudio, setDidInitAudio] = useState(false)
  const { popoverVisibility, setPopoverVisibility } = useContext(PauseContext)

  useEffect(() => {
    const a = async () => {
      if (track.coverArt) {
        const color = await getDominantColor(track.coverArt)
        setBackgroundColor(color)
      }
    }
    a()
  }, [track, setBackgroundColor])

  const {
    playingState,
    duration,
    position,
    loadTrack,
    mediaKey,
    seekTo,
    onTogglePlay,
    initAudio,
    isBuffering
  } = usePlayback(track.id)

  const didTogglePlay = () => {
    if (!didInitAudio) {
      initAudio()
      loadTrack(track.segments)
      setDidInitAudio(true)
    }
    onTogglePlay()
    if (playingState === PlayingState.Playing) {
      setPopoverVisibility(true)
    }
  }

  const playbarEnabled = playingState !== PlayingState.Buffering && !popoverVisibility
  useSpacebar(didTogglePlay, playbarEnabled)

  useRecordListens(position, mediaKey, track.id, LISTEN_INTERVAL_SECONDS)

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
    console.log('Rending compact')
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
