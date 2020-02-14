import { h } from 'preact'

import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import AudioStream from '../../audio/AudioStream'
import { GetTracksResponse } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'
import { PlayingState } from '../playbutton/PlayButton'
import TrackPlayerCompact from './TrackPlayerCompact'

interface TrackPlayerContainerProps {
  flavor: PlayerFlavor
  track: GetTracksResponse
}

const SEEK_INTERVAL = 200

const TrackPlayerContainer = ({
  flavor,
  track
}: TrackPlayerContainerProps) => {

  const [timing, setTiming] = useState({ position: 0, duration: 0 })
  const seekInterval = useRef<number>(null)
  const [playCounter, setPlayCounter] = useState(0)
  const [prevPlayCounter, setPrevPlayCounter] = useState<number>(0)
  const [mediaKey, setMediaKey] = useState(0)
  const [playingState, setPlayingState] = useState<PlayingState>(PlayingState.Stopped)

  // Finish the song
  const onAudioEnd = () => {
    console.log('Audio ended!')
    setPlayingState(PlayingState.Stopped)
    clearInterval(seekInterval.current)
    setTiming({ position: 0, duration: audioRef.current.getDuration() })
    setMediaKey(m => m + 1)
  }

  const audioRef = useRef(new AudioStream())

  // Load the audio ref
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) { return }
    audio.load(track.segments, onAudioEnd)
    console.log('setting timing in end!')
    setTiming({ position: 0, duration: audio.getDuration() })
  }, [])

  const startSeeking = useCallback(() => {
    clearInterval(seekInterval.current)

    seekInterval.current = window.setInterval(async () => {
      const audio = audioRef.current
      if (!audio) { return }
      const position = audio.getPosition()
      const duration = audio.getDuration()
      setTiming({ position, duration })
    }, SEEK_INTERVAL)
  }, [audioRef, setTiming])
  
  // Clean up
  useEffect(() => {
    return () => {
      if (seekInterval.current) { clearInterval(seekInterval.current) }
    }
  }, [seekInterval])

  // The play counter changes (same song again or new song)
  useEffect(() => {
    if (playCounter !== prevPlayCounter) {
      setPrevPlayCounter(playCounter)
      setMediaKey(m => m + 1)
      startSeeking()
    }
  }, [playCounter, prevPlayCounter, startSeeking, timing, setTiming, setMediaKey])

  const onTogglePlay = useCallback(() => {
    switch (playingState) {
      case PlayingState.Stopped:
        setPlayingState(PlayingState.Playing)
        audioRef.current?.play()
        setPlayCounter(p => p + 1)
        break
      case PlayingState.Buffering:
        break
      case PlayingState.Paused:
        setPlayingState(PlayingState.Playing)
        audioRef.current?.play()
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
        mediaKey={mediaKey}
        handle={track.handle}
        artistName={track.userName}
        playingState={playingState}
        albumArtURL={track.coverArt}
        onTogglePlay={onTogglePlay}
        onShare={() => {}}
        isVerified={track.isVerified}
        seekTo={seekTo}
        position={timing.position}
        duration={timing.duration}
        trackURL={track.urlPath}
      />
    )
  }
  return null
}

export default TrackPlayerContainer
