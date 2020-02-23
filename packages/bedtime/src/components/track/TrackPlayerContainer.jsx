import { h } from 'preact'
import { useCallback, useEffect, useState, useContext } from 'preact/hooks'

import { GetTracksResponse } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'
import TrackPlayerCompact from './TrackPlayerCompact'
import usePlayback from '../../hooks/usePlayback'
import { PauseContext } from '../pausedpopover/PauseProvider'
import TrackPlayerCard from './TrackPlayerCard'

// TODO: props
// interface TrackPlayerContainerProps {
//   flavor: PlayerFlavor
//   track: GetTracksResponse
// }

const TrackPlayerContainer = ({
  flavor,
  track,
  isTwitter
}) => {

  const backgroundColor = '#ED6C32'
  const [didInitAudio, setDidInitAudio] = useState(false)
  const { pause } = useContext(PauseContext)

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
  } = usePlayback()

  const didTogglePlay = () => {
    if (!didInitAudio) {
      initAudio()
      loadTrack(track.segments)
      setDidInitAudio(true)
    }
    onTogglePlay()
  }

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
    onAfterPause: pause
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
