import { h } from 'preact'
import { useCallback, useEffect } from 'preact/hooks'

import { GetTracksResponse } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'
import TrackPlayerCompact from './TrackPlayerCompact'

import usePlayback from '../../hooks/usePlayback'

interface TrackPlayerContainerProps {
  flavor: PlayerFlavor
  track: GetTracksResponse
}

const TrackPlayerContainer = ({
  flavor,
  track
}: TrackPlayerContainerProps) => {

  const backgroundColor = 'orange'

  const {
    playingState,
    duration,
    position,
    loadTrack,
    mediaKey,
    seekTo,
    onTogglePlay
  } = usePlayback()

  // Load the audio ref
  useEffect(() => {
    loadTrack(track.segments)
  }, [])

  const onShare = useCallback(() => {

  }, [])

  if (flavor === PlayerFlavor.COMPACT) {
    return (
      <TrackPlayerCompact
        title={track.title}
        mediaKey={mediaKey}
        handle={track.handle}
        artistName={track.userName}
        playingState={playingState}
        albumArtURL={track.coverArt}
        onTogglePlay={onTogglePlay}
        onShare={() => {}}
        isVerified={track.isVerified}
        seekTo={seekTo}
        position={position}
        duration={duration}
        trackURL={track.urlPath}
        backgroundColor={backgroundColor}
      />
    )
  }
  return null
}

export default TrackPlayerContainer
