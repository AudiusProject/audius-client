import { h } from 'preact'
import { useState, useContext, useCallback, useEffect } from 'preact/hooks'

import { PlayerFlavor } from '../app'
import TrackPlayerCompact from './TrackPlayerCompact'
import TrackPlayerTiny from './TrackPlayerTiny'
import usePlayback from '../../hooks/usePlayback'
import { PauseContext } from '../pausedpopover/PauseProvider'
import TrackPlayerCard from './TrackPlayerCard'
import { useSpacebar } from '../../hooks/useSpacebar'
import { useRecordListens } from '../../hooks/useRecordListens'
import { PlayingState } from '../playbutton/PlayButton'
import { isMobile } from '../../util/isMobile'
import { formatGateways } from '../../util/gatewayUtil'

const LISTEN_INTERVAL_SECONDS = 1

const TrackPlayerContainer = ({
  flavor,
  track,
  isTwitter,
  backgroundColor,
  did404
}) => {
  const [didInitAudio, setDidInitAudio] = useState(false)
  const { popoverVisibility, setPopoverVisibility } = useContext(PauseContext)

  const onTrackEnd = useCallback(() => {
    if (flavor !== PlayerFlavor.TINY) {
      setPopoverVisibility(true)
    }
  }, [flavor, setPopoverVisibility])

  const {
    playingState,
    duration,
    position,
    loadTrack,
    mediaKey,
    seekTo,
    onTogglePlay,
    initAudio,
    stop
  } = usePlayback(track.id, onTrackEnd)

  const didTogglePlay = useCallback(() => {
    if (!didInitAudio) {
      initAudio()
      loadTrack(track.segments, formatGateways(track.gateways))
      setDidInitAudio(true)
    }
    onTogglePlay()
    if (playingState === PlayingState.Playing && flavor !== PlayerFlavor.TINY) {
      setPopoverVisibility(true)
    } else if (playingState === PlayingState.Paused){
      setPopoverVisibility(false)
    }
  }, [
    didInitAudio,
    initAudio,
    loadTrack,
    setDidInitAudio,
    onTogglePlay,
    playingState,
    setPopoverVisibility,
    flavor
  ])

  const playbarEnabled = playingState !== PlayingState.Buffering && !popoverVisibility
  useSpacebar(didTogglePlay, playbarEnabled)
  useRecordListens(position, mediaKey, track.id, LISTEN_INTERVAL_SECONDS)

  // Setup autoplay on twitter
  useEffect(() => {
    const mobile = isMobile()
    if (!isTwitter || mobile) return
    initAudio()
    loadTrack(track.segments, formatGateways(track.gateways))
    setDidInitAudio(true)
    onTogglePlay()
  }, [])

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data) {
        try {
          const messageData = JSON.parse(e.data)
          const { from, method, value } = messageData
          if (from && from == 'audiusapi') {
            if (method === 'togglePlay') didTogglePlay()
            if (method === 'stop') stop()
            if (method === 'seekTo') seekTo(value)
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [didTogglePlay])

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
    did404
  }

  if (flavor === PlayerFlavor.COMPACT) {
    return (
      <TrackPlayerCompact
        {...props}
      />
    )
  }

  if (flavor === PlayerFlavor.TINY) {
    return (
      <TrackPlayerTiny
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
