import { h } from 'preact'
import { useCallback, useEffect } from 'preact/hooks'

import { GetTracksResponse } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'
import TrackPlayerCompact from './TrackPlayerCompact'

import usePlayback from '../../hooks/usePlayback'
import TrackPlayerCard from './TrackPlayerCard'

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

  const props = {
    title: track.title,
    mediaKey,
    handle: track.handle,
    artistName: track.userName,
    playingState,
    albumArtURL: track.coverArt,
    onTogglePlay,
    onShare: () => {},
    isVerified: track.isVerified,
    seekTo,
    position,
    duration,
    trackURL: track.urlPath,
    backgroundColor
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
