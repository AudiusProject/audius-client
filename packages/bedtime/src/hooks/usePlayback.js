import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import AudioStream from '../audio/AudioStream'
import { PlayingState } from '../components/playbutton/PlayButton'
import { recordPlay, recordPause } from '../analytics/analytics'

const SEEK_INTERVAL = 200

// TODO: proptypes
// export interface OnAfterAudioEndArguments {
//   stop: () => void
//   onTogglePlay: () => void
//   load: (trackSegments: any) => void
// }

const usePlayback = (id, onAfterAudioEnd) => {
  const [timing, setTiming] = useState({ position: 0, duration: 0 })
  const seekInterval = useRef(null)
  const [playCounter, setPlayCounter] = useState(0)
  const [prevPlayCounter, setPrevPlayCounter] = useState(0)
  const [mediaKey, setMediaKey] = useState(0)
  const playingStateRef = useRef(PlayingState.Stopped)

  // The AudioStream must be initialized in response
  // to a user event to avoid angering the Chrome gods.
  const audioRef = useRef(null)
  const initAudio = () => {
    audioRef.current = new AudioStream()
  }

  // We may need to manually trigger a rerender in the case
  // that the playingStateRef changes. We need to store the playingState
  // in a ref (as opposed to useState) because stale values
  // can be easily captured by clients. But we also need to give
  // clients the most recent version to update their UI, so we manually
  // trigger a rerender if we update the ref.
  const [, setRerenderBool] = useState(true)
  const setPlayingStateRef = (state) => {
    setRerenderBool(b => !b)
    playingStateRef.current = state
  }

  // Hold onto the callbacks we return as refs, to be passed into
  // onTrackEnd to break the cyclic dependeny here.
  const togglePlayRef = useRef(() => {})
  const loadRef = useRef((trackSegments) => {})
  const stopRef = useRef(() => {})

  // On track end, we need to be able to refer to the
  // latest updated onAfterAudioEnd function passed in
  // by the client.
  const onAfterAudioEndRef = useRef(onAfterAudioEnd)
  // Always call the latest onAudioEnd callback
  const onAfterAudioEndCallback = () => {
    onAfterAudioEndRef.current({
      stop: stopRef.current,
      onTogglePlay: togglePlayRef.current,
      load: loadRef.current
    })
  }

  // Update the ref when a new callback function is provided.
  useEffect(() => {
    onAfterAudioEndRef.current = onAfterAudioEnd
  }, [onAfterAudioEndRef, onAfterAudioEnd])

  const onAudioEnd = () => {
    if (!audioRef.current) { throw new Error('Init not called') }
    console.log('Audio ended!')
    setPlayingStateRef(PlayingState.Stopped)
    clearInterval(seekInterval.current)
    setTiming({ position: 0, duration: audioRef.current.getDuration() })
    setMediaKey(m => m + 1)
    onAfterAudioEndCallback()
  }

  // TODO: type trackSegments
  const loadTrack = useCallback((trackSegments) => {
    if (!audioRef.current) { throw new Error('Init not called') }
    audioRef.current.load(trackSegments, onAudioEnd)
    setTiming({ position: 0, duration: audioRef.current.getDuration() })
  }, [audioRef, setTiming])
  loadRef.current = loadTrack

  const startSeeking = useCallback(() => {
    clearInterval(seekInterval.current)

    seekInterval.current = window.setInterval(async () => {
      const audio = audioRef.current
      if (!audio) { return }
      const position = audio.getPosition()
      const duration = audio.getDuration()
      setTiming({ position, duration })

      const isBuffering = audio.isBuffering()
      if (isBuffering && playingStateRef.current !== PlayingState.Buffering) {
        playingStateRef.current = PlayingState.Buffering
        console.log('Setting buffering')
        setRerenderBool(r => !r)
      } else if (!isBuffering && playingStateRef.current === PlayingState.Buffering) {
        playingStateRef.current = PlayingState.Playing
        console.log('Unsetting buffering')
        setRerenderBool(r => !r)
      }

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

  const seekTo = useCallback((location) => {
    const audio = audioRef.current
    if (!audio) { return }
    audio.seek(location)
  }, [])

  const onTogglePlay = useCallback((idOverride) => {
    switch (playingStateRef.current) {
      case PlayingState.Stopped:
        setPlayingStateRef(PlayingState.Playing)
        audioRef.current?.play()
        setPlayCounter(p => p + 1)
        recordPlay(idOverride || id)
        break
      case PlayingState.Buffering:
        break
      case PlayingState.Paused:
        setPlayingStateRef(PlayingState.Playing)
        audioRef.current?.play()
        recordPlay(idOverride || id)
        break
      case PlayingState.Playing:
        setPlayingStateRef(PlayingState.Paused)
        audioRef.current?.pause()
        recordPause(idOverride || id)
        break
    }
  }, [playingStateRef, setPlayingStateRef, id])
  togglePlayRef.current = onTogglePlay

  // TODO: remove this?
  const play = useCallback(() => {
    audioRef.current?.play()
    setPlayingStateRef(PlayingState.Playing)
  }, [audioRef])

  const stop = useCallback(() => {
    audioRef.current?.stop()
    setPlayingStateRef(PlayingState.Stopped)

    setTiming(t => ({ position: 0, duration: t.duration }))
  }, [audioRef, playingStateRef, setTiming])

  stopRef.current = stop

  return {
    initAudio,
    playingState: playingStateRef.current,
    duration: timing.duration,
    position: timing.position,
    loadTrack,
    mediaKey,
    seekTo,
    onTogglePlay,
    play,
    stop,
  }
}

export default usePlayback
