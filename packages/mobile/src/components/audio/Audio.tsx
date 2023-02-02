import { useState, useRef, useEffect, useCallback } from 'react'

import type { Track } from '@audius/common'
import {
  cacheUsersSelectors,
  cacheTracksSelectors,
  hlsUtils,
  playerSelectors,
  playerActions,
  queueActions,
  queueSelectors,
  reachabilitySelectors,
  RepeatMode,
  FeatureFlags,
  encodeHashId,
  Genre,
  tracksSocialActions,
  SquareSizes,
  shallowCompare
} from '@audius/common'
import { isEqual } from 'lodash'
import queue from 'react-native-job-queue'
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  usePlaybackState,
  useTrackPlayerEvents,
  RepeatMode as TrackPlayerRepeatMode,
  TrackType
} from 'react-native-track-player'
import { useDispatch, useSelector } from 'react-redux'
import { useEffectOnce } from 'react-use'

import { DEFAULT_IMAGE_URL } from 'app/components/image/TrackImage'
import { getImageSourceOptimistic } from 'app/hooks/useContentNodeImage'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { getLocalTrackImageSource } from 'app/hooks/useLocalImage'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { apiClient } from 'app/services/audius-api-client'
import { audiusBackendInstance } from 'app/services/audius-backend-instance'
import {
  getLocalAudioPath,
  isAudioAvailableOffline
} from 'app/services/offline-downloader'
import type { PlayCountWorkerPayload } from 'app/services/offline-downloader/workers/playCounterWorker'
import { PLAY_COUNTER_WORKER } from 'app/services/offline-downloader/workers/playCounterWorker'
import { getOfflineDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'

const { getUsers } = cacheUsersSelectors
const { getTracks } = cacheTracksSelectors
const { getPlaying, getSeek, getCurrentTrack, getCounter } = playerSelectors
const { recordListen } = tracksSocialActions
const { getIndex, getOrder, getRepeat, getShuffle } = queueSelectors
const { getIsReachable } = reachabilitySelectors

// TODO: These constants are the same in now playing drawer. Move them to shared location
const SKIP_DURATION_SEC = 15
const RESTART_THRESHOLD_SEC = 3
const RECORD_LISTEN_SECONDS = 1

const defaultCapabilities = [
  Capability.Play,
  Capability.Pause,
  Capability.SkipToNext,
  Capability.SkipToPrevious
]
const podcastCapabilities = [
  ...defaultCapabilities,
  Capability.JumpForward,
  Capability.JumpBackward
]

// Set options for controlling music on the lock screen when the app is in the background
const updatePlayerOptions = async (isPodcast = false) => {
  const coreCapabilities = isPodcast ? podcastCapabilities : defaultCapabilities
  return await TrackPlayer.updateOptions({
    // Media controls capabilities
    capabilities: [...coreCapabilities, Capability.Stop, Capability.SeekTo],
    // Capabilities that will show up when the notification is in the compact form on Android
    compactCapabilities: coreCapabilities,
    // Notification form capabilities
    notificationCapabilities: coreCapabilities,
    android: {
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
    }
  })
}

const playerEvents = [
  Event.PlaybackError,
  Event.PlaybackProgressUpdated,
  Event.PlaybackQueueEnded,
  Event.PlaybackTrackChanged,
  Event.RemotePlay,
  Event.RemotePause,
  Event.RemoteNext,
  Event.RemotePrevious,
  Event.RemoteJumpForward,
  Event.RemoteJumpBackward,
  Event.RemoteSeek
]

export const Audio = () => {
  const { isEnabled: isStreamMp3Enabled } = useFeatureFlag(
    FeatureFlags.STREAM_MP3
  )
  // const progress = useProgress(100) // 100ms update interval
  const playbackState = usePlaybackState()
  const track = useSelector(getCurrentTrack)
  const playing = useSelector(getPlaying)
  const seek = useSelector(getSeek)
  const counter = useSelector(getCounter)
  const repeatMode = useSelector(getRepeat)

  const isReachable = useSelector(getIsReachable)
  const isNotReachable = isReachable === false
  const isOfflineModeEnabled = useIsOfflineModeEnabled()

  // Queue Things
  const queueIndex = useSelector(getIndex)
  const queueShuffle = useSelector(getShuffle)
  const queueOrder = useSelector(getOrder)
  const queueTrackUids = queueOrder.map((trackData) => trackData.uid)
  const queueTrackIds = queueOrder.map((trackData) => trackData.id)
  const queueTrackMap = useSelector(
    (state) => getTracks(state, { uids: queueTrackUids }),
    shallowCompare
  )
  const queueTracks = queueOrder.map(
    (trackData) => queueTrackMap[trackData.id] as Track
  )
  const queueTrackOwnerIds = queueTracks.map((track) => track.owner_id)
  const queueTrackOwnersMap = useSelector(
    (state) => getUsers(state, { ids: queueTrackOwnerIds }),
    shallowCompare
  )

  // A map from trackId to offline availability
  const offlineAvailabilityByTrackId = useSelector((state) => {
    const offlineTrackStatus = getOfflineDownloadStatus(state)
    return queueTrackIds.reduce((result, id) => {
      if (offlineTrackStatus[id] === OfflineDownloadStatus.SUCCESS) {
        return {
          ...result,
          [id]: true
        }
      }
      return result
    }, {})
  }, isEqual)

  const dispatch = useDispatch()

  const isPodcastRef = useRef<boolean>(false)
  const [isAudioSetup, setIsAudioSetup] = useState(false)

  const play = useCallback(() => dispatch(playerActions.play()), [dispatch])
  const pause = useCallback(() => dispatch(playerActions.pause()), [dispatch])
  const next = useCallback(() => dispatch(queueActions.next()), [dispatch])
  const previous = useCallback(
    () => dispatch(queueActions.previous()),
    [dispatch]
  )
  const reset = useCallback(
    () => dispatch(playerActions.reset({ shouldAutoplay: false })),
    [dispatch]
  )
  const updateQueueIndex = useCallback(
    (index: number) => dispatch(queueActions.updateIndex({ index })),
    [dispatch]
  )
  const updatePlayerInfo = useCallback(
    ({ trackId, uid }: { trackId: number; uid: string }) => {
      dispatch(playerActions.set({ trackId, uid }))
    },
    [dispatch]
  )
  const incrementCount = useCallback(
    () => dispatch(playerActions.incrementCount()),
    [dispatch]
  )

  // Perform initial setup for the track player
  const setupTrackPlayer = async () => {
    if (isAudioSetup) return
    await TrackPlayer.setupPlayer()
    setIsAudioSetup(true)
    await updatePlayerOptions()
  }

  useEffectOnce(() => {
    setupTrackPlayer()
  })

  // When component unmounts (App is closed), reset
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  useTrackPlayerEvents(playerEvents, async (event) => {
    const duration = await TrackPlayer.getDuration()
    const position = await TrackPlayer.getPosition()

    if (event.type === Event.PlaybackError) {
      console.error(`err ${event.code}:` + event.message)
    }

    if (event.type === Event.RemotePlay || event.type === Event.RemotePause) {
      playing ? pause() : play()
    }
    if (event.type === Event.RemoteNext) next()
    if (event.type === Event.RemotePrevious) {
      if (position > RESTART_THRESHOLD_SEC) {
        setSeekPosition(0)
      } else {
        previous()
      }
    }

    if (event.type === Event.RemoteSeek) {
      setSeekPosition(event.position)
    }
    if (event.type === Event.RemoteJumpForward) {
      setSeekPosition(Math.min(duration, position + SKIP_DURATION_SEC))
    }
    if (event.type === Event.RemoteJumpBackward) {
      setSeekPosition(Math.max(0, position - SKIP_DURATION_SEC))
    }

    if (event.type === Event.PlaybackQueueEnded) {
      // TODO: Queue ended, what should done here?
    }

    if (event.type === Event.PlaybackTrackChanged) {
      const playerIndex = await TrackPlayer.getCurrentTrack()
      if (playerIndex === null) return

      // Manually increment player count if we are repeating
      if ((await TrackPlayer.getRepeatMode()) === TrackPlayerRepeatMode.Track) {
        incrementCount()
      }

      // Update queue and player state if the track player auto plays next track
      if (playerIndex !== queueIndex) {
        if (queueShuffle) {
          // TODO: There will be a very short period where the next track in the queue is played instead of the next shuffle track.
          // Figure out how to call next earlier
          next()
        } else {
          updateQueueIndex(playerIndex)
          const track = queueTracks[playerIndex]
          updatePlayerInfo({
            trackId: track.track_id,
            uid: queueTrackUids[playerIndex]
          })
        }
      }

      const isPodcast = queueTracks[playerIndex]?.genre === Genre.PODCASTS
      if (isPodcast !== isPodcastRef.current) {
        isPodcastRef.current = isPodcast
        await updatePlayerOptions(isPodcast)
      }
    }
  })

  // Record play effect
  useEffect(() => {
    const trackId = track?.track_id
    if (!trackId) return

    const playCounterTimeout = setTimeout(() => {
      if (isReachable) {
        dispatch(recordListen(trackId))
      } else if (isOfflineModeEnabled) {
        queue.addJob<PlayCountWorkerPayload>(PLAY_COUNTER_WORKER, { trackId })
      }
    }, RECORD_LISTEN_SECONDS)

    return () => clearTimeout(playCounterTimeout)
  }, [counter, dispatch, isOfflineModeEnabled, isReachable, track?.track_id])

  // A ref to invalidate the current progress counter and prevent
  // stale values of audio progress from propagating back to the UI.
  const progressInvalidator = useRef(false)

  const setSeekPosition = useCallback(
    (seek = 0) => {
      progressInvalidator.current = true
      TrackPlayer.seekTo(seek)
    },
    [progressInvalidator]
  )

  // Seek handler
  useEffect(() => {
    if (seek !== null) {
      setSeekPosition(seek)
    }
  }, [seek, setSeekPosition])

  // Keep track of the track index the last time counter was updated
  const counterTrackIndex = useRef<number | null>(null)

  const resetPositionForSameTrack = useCallback(() => {
    // NOTE: Make sure that we only set seek position to 0 when we are restarting a track
    if (queueIndex === counterTrackIndex.current) setSeekPosition(0)
    counterTrackIndex.current = queueIndex
  }, [queueIndex, setSeekPosition])

  const counterRef = useRef<number | null>(null)

  // Restart (counter) handler
  useEffect(() => {
    if (counter !== counterRef.current) {
      counterRef.current = counter
      resetPositionForSameTrack()
    }
  }, [counter, resetPositionForSameTrack])

  // Ref to keep track of the queue in the track player vs the queue in state
  const queueListRef = useRef<string[]>([])
  // Ref to ensure that we do not try to update while we are already updating
  const updatingQueueRef = useRef<boolean>(false)

  const handleQueueChange = useCallback(async () => {
    const refUids = queueListRef.current
    if (queueIndex === -1 || isEqual(refUids, queueTrackUids)) return

    updatingQueueRef.current = true
    queueListRef.current = queueTrackUids

    // Check if this is a new queue or we are appending to the queue
    const isQueueAppend =
      refUids.length > 0 &&
      isEqual(queueTrackUids.slice(0, refUids.length), refUids)
    const newQueueTracks = isQueueAppend
      ? queueTracks.slice(refUids.length)
      : queueTracks

    const newTrackData = await Promise.all(
      newQueueTracks.map(async (track) => {
        const trackOwner = queueTrackOwnersMap[track.owner_id]
        const trackId = track.track_id.toString()
        const offlineTrackAvailable =
          trackId &&
          isOfflineModeEnabled &&
          offlineAvailabilityByTrackId[trackId] &&
          (await isAudioAvailableOffline(trackId))

        // Get Track url
        let url: string
        let isM3u8 = false
        if (offlineTrackAvailable) {
          const audioFilePath = getLocalAudioPath(trackId)
          url = `file://${audioFilePath}`
        } else if (isStreamMp3Enabled && isReachable) {
          url = apiClient.makeUrl(
            `/tracks/${encodeHashId(track.track_id)}/stream`
          )
        } else {
          isM3u8 = true
          const ownerGateways =
            audiusBackendInstance.getCreatorNodeIPFSGateways(
              trackOwner.creator_node_endpoint
            )
          url = hlsUtils.generateM3U8Variants({
            segments: track?.track_segments ?? [],
            gateways: ownerGateways
          })
        }

        const localSource =
          isNotReachable && track
            ? await getLocalTrackImageSource(trackId)
            : undefined

        const imageUrl =
          getImageSourceOptimistic({
            cid: track ? track.cover_art_sizes || track.cover_art : null,
            user: trackOwner,
            size: SquareSizes.SIZE_1000_BY_1000,
            localSource
          })?.uri ?? DEFAULT_IMAGE_URL

        return {
          url,
          type: isM3u8 ? TrackType.HLS : TrackType.Default,
          title: track?.title,
          artist: trackOwner?.name,
          genre: track?.genre,
          date: track?.created_at,
          artwork: imageUrl,
          duration: track?.duration
        }
      })
    )

    if (isQueueAppend) {
      await TrackPlayer.add(newTrackData)
    } else {
      // New queue, reset before adding new tracks
      // NOTE: Should only happen when the user selects a new lineup so reset should never be called in the background and cause an error
      await TrackPlayer.reset()
      await TrackPlayer.add(newTrackData)
      if (queueIndex < newQueueTracks.length) {
        await TrackPlayer.skip(queueIndex)
      }
    }

    if (playing) await TrackPlayer.play()
    updatingQueueRef.current = false
  }, [
    isNotReachable,
    isOfflineModeEnabled,
    isReachable,
    isStreamMp3Enabled,
    offlineAvailabilityByTrackId,
    playing,
    queueIndex,
    queueTrackOwnersMap,
    queueTrackUids,
    queueTracks
  ])

  const handleQueueIdxChange = useCallback(async () => {
    const playerIdx = await TrackPlayer.getCurrentTrack()
    const queue = await TrackPlayer.getQueue()

    if (
      !updatingQueueRef.current &&
      queueIndex !== -1 &&
      queueIndex !== playerIdx &&
      queueIndex < queue.length
    ) {
      await TrackPlayer.skip(queueIndex)
    }
  }, [queueIndex])

  const handleTogglePlay = useCallback(async () => {
    if (playbackState === State.Playing && !playing) {
      await TrackPlayer.pause()
    } else if (
      (playbackState === State.Paused ||
        playbackState === State.Ready ||
        playbackState === State.Stopped) &&
      playing
    ) {
      await TrackPlayer.play()
    }
  }, [playbackState, playing])

  const handleRepeatModeChange = useCallback(async () => {
    if (repeatMode === RepeatMode.SINGLE) {
      await TrackPlayer.setRepeatMode(TrackPlayerRepeatMode.Track)
    } else if (repeatMode === RepeatMode.ALL) {
      await TrackPlayer.setRepeatMode(TrackPlayerRepeatMode.Queue)
    } else {
      await TrackPlayer.setRepeatMode(TrackPlayerRepeatMode.Off)
    }
  }, [repeatMode])

  useEffect(() => {
    handleRepeatModeChange()
  }, [handleRepeatModeChange, repeatMode])

  useEffect(() => {
    handleQueueChange()
  }, [handleQueueChange, queueTrackUids])

  useEffect(() => {
    handleQueueIdxChange()
  }, [handleQueueIdxChange, queueIndex])

  useEffect(() => {
    handleTogglePlay()
  }, [handleTogglePlay, playing])

  return null
}
