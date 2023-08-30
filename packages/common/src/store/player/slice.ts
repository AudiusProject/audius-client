import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { UID, ID, Collectible } from '../../models'
import { Maybe, Nullable } from '../../utils'

import { PlaybackRate } from './types'

export type PlayerState = {
  // Identifiers for the audio that's playing.
  uid: UID | null
  trackId: ID | null

  collectible: Collectible | null

  // Keep 'playing' in the store separately from the audio
  // object to allow components to subscribe to changes.
  playing: boolean

  // Indicates that current playback session is a track preview
  previewing: boolean

  // Keep 'buffering' in the store separately from the audio
  // object to allow components to subscribe to changes.
  buffering: boolean

  // Unique integer that increments every time something is "played."
  // E.g. replaying a track doesn't change uid or trackId, but counter changes.
  counter: number

  // Keep 'playbackRate' in the store separately from the audio
  // Playback rate of the audio element
  playbackRate: PlaybackRate

  // Seek time into the track when a user scrubs forward or backward
  seek: number | null

  // Counter to track seek calls for times where we seek to the same position multiple times
  seekCounter: number
}

export const initialState: PlayerState = {
  uid: null,
  trackId: null,

  collectible: null,

  playing: false,
  previewing: false,
  buffering: false,
  counter: 0,
  playbackRate: '1x',
  seek: null,
  seekCounter: 0
}

type PlayPayload = Maybe<{
  uid?: Nullable<UID>
  trackId?: ID
  isPreview?: boolean
  onEnd?: (...args: any) => any
}>

type PlaySucceededPayload = {
  isPreview?: boolean
  uid?: Nullable<UID>
  trackId?: ID
}

type PlayCollectiblePayload = {
  collectible: Collectible
  onEnd?: (...args: any) => any
}

type PlayCollectibleSucceededPayload = {
  collectible: Collectible
}

type PausePayload = Maybe<{
  // Optionally allow only setting state which doesn't actually
  // invoke a .pause on the internal audio object. This is used in
  // native mobile audio only.
  onlySetState?: boolean
}>

type StopPayload = {}

type SetBufferingPayload = {
  buffering: boolean
}

type SetPayload = {
  uid: UID
  trackId: ID
}

type SeekPayload = {
  seconds: number
}

type SetPlaybackRatePayload = {
  rate: PlaybackRate
}

type ErrorPayload = {
  error: string
  trackId: ID
  info: string
}

type ResetPayload = {
  shouldAutoplay: boolean
}

type ResetSucceededPayload = {
  shouldAutoplay: boolean
}

const slice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    play: (_state, _action: PayloadAction<PlayPayload>) => {},
    playSucceeded: (state, action: PayloadAction<PlaySucceededPayload>) => {
      const { uid, trackId } = action.payload
      state.playing = true
      if (!uid || !trackId) return
      state.uid = uid || state.uid
      state.trackId = trackId || state.trackId
      state.collectible = null
      state.counter = state.counter + 1
      state.previewing = !!action.payload.isPreview
    },
    playCollectible: (
      _state,
      _action: PayloadAction<PlayCollectiblePayload>
    ) => {},
    playCollectibleSucceeded: (
      state,
      action: PayloadAction<PlayCollectibleSucceededPayload>
    ) => {
      const { collectible } = action.payload
      state.playing = true
      state.uid = null
      state.trackId = null
      state.collectible = collectible || state.collectible
    },
    pause: (state, _action: PayloadAction<PausePayload>) => {
      state.playing = false
    },
    setBuffering: (state, action: PayloadAction<SetBufferingPayload>) => {
      const { buffering } = action.payload
      state.buffering = buffering
    },
    stop: (state, _action: PayloadAction<StopPayload>) => {
      state.playing = false
      state.uid = null
      state.trackId = null
      state.counter = state.counter + 1
    },
    set: (state, action: PayloadAction<SetPayload>) => {
      const { uid, trackId } = action.payload
      state.uid = uid
      state.trackId = trackId
    },
    reset: (_state, _action: PayloadAction<ResetPayload>) => {},
    resetSucceeded: (state, action: PayloadAction<ResetSucceededPayload>) => {
      const { shouldAutoplay } = action.payload
      state.playing = shouldAutoplay
      state.counter = state.counter + 1
    },
    seek: (state, action: PayloadAction<SeekPayload>) => {
      const { seconds } = action.payload
      state.seek = seconds
      state.seekCounter++
    },
    setPlaybackRate: (state, action: PayloadAction<SetPlaybackRatePayload>) => {
      const { rate } = action.payload
      state.playbackRate = rate
    },
    error: (_state, _action: PayloadAction<ErrorPayload>) => {},
    incrementCount: (state) => {
      state.counter = state.counter + 1
    }
  }
})

export const {
  play,
  playSucceeded,
  playCollectible,
  playCollectibleSucceeded,
  pause,
  stop,
  setBuffering,
  set,
  reset,
  resetSucceeded,
  seek,
  setPlaybackRate,
  error,
  incrementCount
} = slice.actions

export default slice.reducer
export const actions = slice.actions
