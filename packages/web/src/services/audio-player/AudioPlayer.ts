import {
  TrackSegment,
  PlaybackRate,
  playbackRateValueMap
} from '@audius/common'

declare global {
  interface Window {
    audio: HTMLAudioElement
    webkitAudioContext: typeof AudioContext
  }
}

const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
const IS_UI_WEBVIEW = /(iPhone|iPod|iPad).*AppleWebKit/i.test(
  navigator.userAgent
)

const FADE_IN_EVENT = new Event('fade-in')
const FADE_OUT_EVENT = new Event('fade-out')
const VOLUME_CHANGE_BASE = 10
const BUFFERING_DELAY_MILLISECONDS = 1000
const FADE_IN_TIME_MILLISECONDS = 320
const FADE_OUT_TIME_MILLISECONDS = 400

const IS_CHROME_LIKE =
  /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)

export enum AudioError {
  AUDIO = 'AUDIO'
}

export class AudioPlayer {
  audio: HTMLAudioElement
  audioCtx: AudioContext | null
  source: MediaElementAudioSourceNode | null
  gainNode: GainNode | null
  duration: number
  playbackRate: PlaybackRate
  bufferingTimeout: ReturnType<typeof setTimeout> | null
  buffering: boolean
  onBufferingChange: (isBuffering: boolean) => void
  concatBufferInterval: ReturnType<typeof setInterval> | null
  nextBufferIndex: number
  loadCounter: number
  recordListenedTime: number
  endedListener: ((this: HTMLAudioElement, e: Event) => void) | null
  waitingListener: ((this: HTMLAudioElement, e: Event) => void) | null
  canPlayListener: ((this: HTMLAudioElement, e: Event) => void) | null
  url: string | null
  onError: (e: string, data: string | Event) => void

  constructor() {
    this.audio = new Audio()
    // Connect this.audio to the window so that 3P's can interact with it.
    window.audio = this.audio

    this.audioCtx = null
    this.source = null
    this.gainNode = null

    // Because we use a media stream, we need the duration from an
    // outside source. Audio.duration returns Infinity until all the streams are
    // concatenated together.
    this.duration = 0

    // Variable to hold the playbackRate of the audio element
    this.playbackRate = '1x'

    this.bufferingTimeout = null
    this.buffering = false
    // Callback fired when buffering status changes
    this.onBufferingChange = (isBuffering) => {}

    this.concatBufferInterval = null
    this.nextBufferIndex = 0
    // Keeps a (monotonic) unique id for each load, so we know when to cancel the previous load.
    this.loadCounter = 0

    this.recordListenedTime = 5 /* seconds */
    // Event listeners
    this.endedListener = null
    this.waitingListener = null
    this.canPlayListener = null

    // M3U8 file
    this.url = null

    // Listen for errors
    this.onError = (e, data) => {}
  }

  _initContext = () => {
    this.audio.addEventListener('canplay', () => {
      if (!this.audioCtx && !IS_SAFARI && !IS_UI_WEBVIEW) {
        // Set up WebAudio API handles
        const AudioContext = window.AudioContext || window.webkitAudioContext
        try {
          this.audioCtx = new AudioContext()
          this.gainNode = this.audioCtx.createGain()
          this.source = this.audioCtx.createMediaElementSource(this.audio)
          this.source.connect(this.gainNode)
          this.gainNode.connect(this.audioCtx.destination)
        } catch (e) {
          console.error('error setting up audio context')
          console.error(e)
        }
      }

      clearTimeout(this.bufferingTimeout!)
      this.buffering = false
      this.onBufferingChange(this.buffering)
    })

    this.audio.onerror = (e) => {
      this.onError(AudioError.AUDIO, e)

      // Handle audio errors by trying to nudge the playhead and re attach media.
      // Simply nudging the media doesn't work.
      //
      // This kind of error only seems to manifest on chrome because, as they say
      // "We tend to be more strict about decoding errors than other browsers.
      // Ignoring them will lead to a/v sync issues."
      // https://bugs.chromium.org/p/chromium/issues/detail?id=1071899
    }
  }

  load = (
    duration: number,
    onEnd: () => void,
    mp3Url: string | null = null
  ) => {
    if (mp3Url) {
      // TODO: Test to make sure that this doesn't break anything
      this.stop()
      const prevVolume = this.audio.volume
      if (this.audio) {
        this.audio.src = ''
        this.audio.remove()
      }
      this.audio = new Audio()

      // Connect this.audio to the window so that 3P's can interact with it.
      window.audio = this.audio

      this.gainNode = null
      this.source = null
      this.audioCtx = null

      this._initContext()
      this.audio.preload = 'none'
      this.audio.crossOrigin = 'anonymous'
      this.audio.src = mp3Url
      this.audio.volume = prevVolume
      this.audio.onloadedmetadata = () => (this.duration = this.audio.duration)
    }

    this.duration = duration

    // Set audio listeners.
    if (this.endedListener) {
      this.audio.removeEventListener('ended', this.endedListener)
    }
    this.endedListener = () => {
      onEnd()
    }
    this.audio.addEventListener('ended', this.endedListener)

    if (this.waitingListener) {
      this.audio.removeEventListener('waiting', this.waitingListener)
    }
    this.waitingListener = () => {
      this.bufferingTimeout = setTimeout(() => {
        this.buffering = true
        this.onBufferingChange(this.buffering)
      }, BUFFERING_DELAY_MILLISECONDS)
    }
    this.audio.addEventListener('waiting', this.waitingListener)
  }

  play = () => {
    // In case we haven't faded out the last pause, pause again and
    // clear our listener for the end of the pause fade.
    this.audio.removeEventListener('fade-out', this._pauseInternal)
    if (this.audio.currentTime !== 0) {
      this._fadeIn()
    } else if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(1, 0)
    }

    // This is a very nasty "hack" to fix a bug in chrome-like webkit browsers.
    // Calling a traditional `audio.pause()` / `play()` and switching tabs leaves the
    // AudioContext in a weird state where after the browser tab enters the background,
    // and then comes back into the foreground, the AudioContext gives misinformation.
    // Weirdly, the audio's playback rate is no longer maintained on resuming playback after a pause.
    // Though the audio itself claims audio.playbackRate = 1.0, the actual resumed speed
    // is nearish 0.9.
    //
    // In chrome like browsers (opera, edge), we disconnect and reconnect the source node
    // instead of playing and pausing the audio element itself, which seems to fix this issue
    // without any side-effects (though this behavior could change?).
    //
    // Another solution to this problem is calling `this.audioCtx.suspend()` and `resume()`,
    // however, that doesn't play nicely with Analyser nodes (e.g. visualizer) because it
    // freezes in place rather than naturally "disconnecting" it from audio.
    //
    // Web resources on this problem are limited (or none?), but this is a start:
    // https://stackoverflow.com/questions/11506180/web-audio-api-resume-from-pause
    if (this.audioCtx && IS_CHROME_LIKE) {
      this.source!.connect(this.gainNode!)
    }

    this._updateAudioPlaybackRate()

    const promise = this.audio.play()
    if (promise) {
      promise.catch((_) => {
        // Let pauses interrupt plays (as the user could be rapidly skipping through tracks).
      })
    }
  }

  pause = () => {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(1, this.audioCtx?.currentTime ?? 0)
    }
    this.audio.addEventListener('fade-out', this._pauseInternal)
    this._fadeOut()
  }

  _pauseInternal = () => {
    if (this.audioCtx && IS_CHROME_LIKE) {
      // See comment above in the `play()` method.
      this.source!.disconnect()
    }
    this.audio.pause()
  }

  stop = () => {
    this.audio.pause()
    this.audio.currentTime = 0
  }

  isPlaying = () => {
    return !this.audio.paused
  }

  isPaused = () => {
    return this.audio.paused
  }

  isBuffering = () => {
    return this.buffering
  }

  getDuration = () => {
    return this.duration
  }

  getPosition = () => {
    return this.audio.currentTime
  }

  getPlaybackRate = () => {
    return this.playbackRate
  }

  getAudioPlaybackRate = () => {
    return this.audio.playbackRate
  }

  seek = (seconds: number) => {
    if (isFinite(seconds)) {
      this.audio.currentTime = seconds
    }
  }

  setVolume = (value: number) => {
    this.audio.volume =
      (Math.pow(VOLUME_CHANGE_BASE, value) - 1) / (VOLUME_CHANGE_BASE - 1)
  }

  setPlaybackRate = (value: PlaybackRate) => {
    this.playbackRate = value
    this._updateAudioPlaybackRate()
  }

  _updateAudioPlaybackRate = () => {
    this.audio.playbackRate = playbackRateValueMap[this.playbackRate]
  }

  _fadeIn = () => {
    if (this.gainNode) {
      setTimeout(() => {
        this.audio.dispatchEvent(FADE_IN_EVENT)
      }, FADE_IN_TIME_MILLISECONDS)
      this.gainNode.gain.exponentialRampToValueAtTime(
        1,
        this.audioCtx!.currentTime + FADE_IN_TIME_MILLISECONDS / 1000.0
      )
    } else {
      this.audio.dispatchEvent(FADE_IN_EVENT)
    }
  }

  _fadeOut = () => {
    if (this.gainNode) {
      setTimeout(() => {
        this.audio.dispatchEvent(FADE_OUT_EVENT)
      }, FADE_OUT_TIME_MILLISECONDS)
      this.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx!.currentTime + FADE_OUT_TIME_MILLISECONDS / 1000.0
      )
    } else {
      this.audio.dispatchEvent(FADE_OUT_EVENT)
    }
  }
}
