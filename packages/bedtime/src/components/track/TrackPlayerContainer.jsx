import { h } from 'preact'
import {
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo
} from 'preact/hooks'

import { PlayerFlavor } from '../app'
import TrackPlayerCompact from './TrackPlayerCompact'
import TrackPlayerTiny from './TrackPlayerTiny'
import usePlayback from '../../hooks/usePlayback'
import { PauseContext } from '../pausedpopover/PauseProvider'
import TrackPlayerCard from './TrackPlayerCard'
import { stripLeadingSlash } from '../../util/stringUtil'
import TrackHelmet from './TrackHelmet'
import { useSpacebar } from '../../hooks/useSpacebar'
import { useRecordListens } from '../../hooks/useRecordListens'
import { PlayingState } from '../playbutton/PlayButton'
import { isMobile } from '../../util/isMobile'
import { formatGateways } from '../../util/gatewayUtil'
import { logError } from '../../util/logError'
import { getTrackStreamEndpoint } from '../../util/BedtimeClient'
import { getIsMp3StreamOn } from '../../util/getEnv'

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

  const trackInfoForPlayback = useMemo(() => {
    return {
      segments: track.track_segments,
      gateways: formatGateways(track.user.creator_node_endpoint),
      title: track.title,
      artistName: track.user.name,
      mp3StreamUrl: getIsMp3StreamOn()
        ? getTrackStreamEndpoint(track.id)
        : undefined
    }
  }, [
    track.id,
    track.title,
    track.track_segments,
    track.user.creator_node_endpoint,
    track.user.name
  ])

  const didTogglePlay = useCallback(() => {
    if (!didInitAudio) {
      initAudio()
      loadTrack(trackInfoForPlayback)
      setDidInitAudio(true)
    }
    onTogglePlay()
    if (playingState === PlayingState.Playing && flavor !== PlayerFlavor.TINY) {
      setPopoverVisibility(true)
    } else if (playingState === PlayingState.Paused) {
      setPopoverVisibility(false)
    }
  }, [
    didInitAudio,
    onTogglePlay,
    playingState,
    flavor,
    initAudio,
    loadTrack,
    setPopoverVisibility,
    trackInfoForPlayback
  ])

  const playbarEnabled =
    playingState !== PlayingState.Buffering && !popoverVisibility
  useSpacebar(didTogglePlay, playbarEnabled)
  useRecordListens(position, mediaKey, track.id, LISTEN_INTERVAL_SECONDS)

  // Setup autoplay on twitter
  useEffect(() => {
    const mobile = isMobile()
    if (!isTwitter || mobile) return
    initAudio()
    loadTrack(trackInfoForPlayback)
    setDidInitAudio(true)
    onTogglePlay()
    // TODO: Fix these deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackInfoForPlayback])

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
          logError(error)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didTogglePlay])

  const albumArtURL = (track.artwork || {})['480x480']

  const props = {
    title: track.title,
    mediaKey,
    handle: track.user.handle,
    artistName: track.user.name,
    playingState,
    albumArtURL,
    onTogglePlay: didTogglePlay,
    isVerified: track.user.is_verified,
    seekTo,
    position,
    duration,
    trackURL: stripLeadingSlash(track.permalink),
    backgroundColor,
    isTwitter,
    did404
  }

  let trackPlayer
  if (flavor === PlayerFlavor.COMPACT) {
    trackPlayer = <TrackPlayerCompact {...props} />
  } else if (flavor === PlayerFlavor.TINY) {
    trackPlayer = <TrackPlayerTiny {...props} />
  } else {
    trackPlayer = <TrackPlayerCard {...props} />
  }
  return (
    <>
      <TrackHelmet track={track} />
      {trackPlayer}
    </>
  )
}

export default TrackPlayerContainer
