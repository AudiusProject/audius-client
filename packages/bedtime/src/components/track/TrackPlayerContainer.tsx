import { h } from 'preact'

import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import AudioStream from '../../audio/AudioStream'
import { GetTracksResponse } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'
import { PlayingState } from '../PlayButton'
import TrackPlayerCompact from './TrackPlayerCompact'

interface TrackPlayerContainerProps {
  flavor: PlayerFlavor
  track: GetTracksResponse
}

const TrackPlayerContainer = ({
  flavor,
  track
}: TrackPlayerContainerProps) => {

  const [timing, setTiming] = useState({ position: 0, duration: 0 })

  const audioRef = useRef(new AudioStream())
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) { return }
    audio.load(track.segments)
  }, [])

  // TODO: refactor all of this into a playing hook
  const [playingState, setPlayingState] = useState<PlayingState>(PlayingState.Paused)

  const onTogglePlay = useCallback(() => {
    switch (playingState) {
      case PlayingState.Buffering:
        break
      case PlayingState.Paused:
        setPlayingState(PlayingState.Playing)
        audioRef.current?.play()
        setTiming(p => ({position: p.position, duration: audioRef.current.getDuration()}))
        break
      case PlayingState.Playing:
        setPlayingState(PlayingState.Paused)
        audioRef.current?.pause()
        break
    }
  }, [playingState])

  const onShare = useCallback(() => {

  }, [])

  const seekTo = useCallback((location: number) => {
    const audio = audioRef.current
    if (!audio) { return }
    audio.seek(location)
  }, [])

  if (flavor === PlayerFlavor.COMPACT) {
    return (
      <TrackPlayerCompact
        title={track.title}
        handle={track.handle}
        playingState={playingState}
        albumArtUrl={track.coverArt}
        onTogglePlay={onTogglePlay}
        onShare={() => {}}
        isVerified={track.isVerified}
        seekTo={seekTo}
        position={20}
        duration={200}
      />
    )
  }
  return null
}

export default TrackPlayerContainer
