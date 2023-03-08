import { useRef, useEffect, useCallback, useState } from 'react'

import type { ID, QueryParams, Track } from '@audius/common'
import {
  playbackRateValueMap,
  cacheUsersSelectors,
  cacheTracksSelectors,
  hlsUtils,
  playerSelectors,
  playerActions,
  queueActions,
  queueSelectors,
  reachabilitySelectors,
  premiumContentSelectors,
  RepeatMode,
  FeatureFlags,
  encodeHashId,
  Genre,
  tracksSocialActions,
  SquareSizes,
  shallowCompare,
  savedPageTracksLineupActions
} from '@audius/common'
import { isEqual } from 'lodash'
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
import { useAsync, usePrevious } from 'react-use'

import { DEFAULT_IMAGE_URL } from 'app/components/image/TrackImage'
import { getImageSourceOptimistic } from 'app/hooks/useContentNodeImage'
import { useIsGatedContentEnabled } from 'app/hooks/useIsGatedContentEnabled'
import { useIsOfflineModeEnabled } from 'app/hooks/useIsOfflineModeEnabled'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { apiClient } from 'app/services/audius-api-client'
import { audiusBackendInstance } from 'app/services/audius-backend-instance'
import {
  getLocalAudioPath,
  getLocalTrackCoverArtPath
} from 'app/services/offline-downloader'
import { DOWNLOAD_REASON_FAVORITES } from 'app/store/offline-downloads/constants'
import {
  getOfflineTrackStatus,
  getIsCollectionMarkedForDownload
} from 'app/store/offline-downloads/selectors'
import {
  addOfflineEntries,
  OfflineDownloadStatus
} from 'app/store/offline-downloads/slice'

const { getUsers } = cacheUsersSelectors
const { getTracks } = cacheTracksSelectors
const { getPlaying, getSeek, getCurrentTrack, getCounter, getPlaybackRate } =
  playerSelectors
const { recordListen } = tracksSocialActions
const {
  getIndex,
  getOrder,
  getSource,
  getCollectionId,
  getRepeat,
  getShuffle
} = queueSelectors
const { getIsReachable } = reachabilitySelectors

const { getPremiumTrackSignatureMap } = premiumContentSelectors

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
  const playbackState = usePlaybackState()
  const track = useSelector(getCurrentTrack)
  const playing = useSelector(getPlaying)
  const seek = useSelector(getSeek)
  const counter = useSelector(getCounter)
  const repeatMode = useSelector(getRepeat)
  const playbackRate = useSelector(getPlaybackRate)

  const isReachable = useSelector(getIsReachable)
  const isNotReachable = isReachable === false
  const isOfflineModeEnabled = useIsOfflineModeEnabled()
  const isGatedContentEnabled = useIsGatedContentEnabled()
  const premiumTrackSignatureMap = useSelector(getPremiumTrackSignatureMap)

  // Queue Things
  const queueIndex = useSelector(getIndex)
  const queueShuffle = useSelector(getShuffle)
  const queueOrder = useSelector(getOrder)
  const queueSource = useSelector(getSource)
  const queueCollectionId = useSelector(getCollectionId)
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

  const isCollectionMarkedForDownload = useSelector(
    getIsCollectionMarkedForDownload(
      queueSource === savedPageTracksLineupActions.prefix
        ? DOWNLOAD_REASON_FAVORITES
        : queueCollectionId?.toString()
    )
  )
  const wasCollectionMarkedForDownload = usePrevious(
    isCollectionMarkedForDownload
  )
  const didOfflineToggleChange =
    isCollectionMarkedForDownload !== wasCollectionMarkedForDownload

  // A map from trackId to offline availability
  const offlineAvailabilityByTrackId = useSelector((state) => {
    const offlineTrackStatus = getOfflineTrackStatus(state)
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
  useAsync(async () => {
    try {
      await TrackPlayer.setupPlayer()
      await updatePlayerOptions()
    } catch (e) {
      // The player has already been set up
    }
    setIsAudioSetup(true)
  }, [])

  // When component unmounts (App is closed), reset
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  // Map of user signature for gated tracks
  const [gatedQueryParamsMap, setGatedQueryParamsMap] = useState<{
    [trackId: ID]: QueryParams
  }>({})

  const handleGatedQueryParams = useCallback(
    async (tracks: Track[]) => {
      const queryParamsMap: { [trackId: ID]: QueryParams } = {}

      for (const track of tracks) {
        const {
          track_id: trackId,
          is_premium: isPremium,
          premium_content_signature
        } = track

        if (gatedQueryParamsMap[trackId]) {
          queryParamsMap[trackId] = gatedQueryParamsMap[trackId]
        } else if (isGatedContentEnabled && isPremium) {
          const data = `Premium content user signature at ${Date.now()}`
          const signature = await audiusBackendInstance.getSignature(data)
          const premiumContentSignature =
            premium_content_signature || premiumTrackSignatureMap[trackId]
          queryParamsMap[trackId] = {
            user_data: data,
            user_signature: signature
          }
          if (premiumContentSignature) {
            queryParamsMap[trackId].premium_content_signature = JSON.stringify(
              premiumContentSignature
            )
          }
        }
      }

      setGatedQueryParamsMap(queryParamsMap)
      return queryParamsMap
    },
    [
      isGatedContentEnabled,
      premiumTrackSignatureMap,
      gatedQueryParamsMap,
      setGatedQueryParamsMap
    ]
  )

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
          const track = queueTracks[playerIndex]

          // Skip track if user does not have access i.e. for an unlocked premium track
          const doesUserHaveAccess = (() => {
            if (!isGatedContentEnabled) {
              return true
            }

            const {
              track_id: trackId,
              is_premium: isPremium,
              premium_content_signature: premiumContentSignature
            } = track

            const hasPremiumContentSignature =
              !!premiumContentSignature ||
              !!(trackId && premiumTrackSignatureMap[trackId])

            return !isPremium || hasPremiumContentSignature
          })()

          if (!doesUserHaveAccess) {
            next()
          } else {
            updateQueueIndex(playerIndex)
            updatePlayerInfo({
              trackId: track.track_id,
              uid: queueTrackUids[playerIndex]
            })
          }
        }
      }

      const isPodcast = queueTracks[playerIndex]?.genre === Genre.PODCASTS
      if (isPodcast !== isPodcastRef.current) {
        isPodcastRef.current = isPodcast
        // Update playback rate based on if the track is a podcast or not
        const newRate = isPodcast ? playbackRateValueMap[playbackRate] : 1.0
        await TrackPlayer.setRate(newRate)
        // Update lock screen and notification controls
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
        dispatch(
          addOfflineEntries({ items: [{ type: 'play-count', id: trackId }] })
        )
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
    if (queueIndex === -1) {
      return
    }
    if (isEqual(refUids, queueTrackUids) && !didOfflineToggleChange) {
      return
    }

    updatingQueueRef.current = true
    queueListRef.current = queueTrackUids

    // Checks to allow for continuous playback while making queue updates
    // Check if we are appending to the end of the queue
    const isQueueAppend =
      refUids.length > 0 &&
      isEqual(queueTrackUids.slice(0, refUids.length), refUids)

    // TODO: Queue removal logic was firing too often previously and causing playback issues when at the end of queues. Need to fix
    // Check if we are removing from the end of the queue
    // const isQueueRemoval =
    //   refUids.length > 0 &&
    //   isEqual(refUids.slice(0, queueTrackUids.length), queueTrackUids)

    // if (isQueueRemoval) {
    //   // NOTE: There might be a case where we are trying to remove the currently playing track.
    //   // Shouldn't be possible, but need to keep an eye out for that
    //   const startingRemovalIndex = queueTrackUids.length
    //   const removalLength = refUids.length - queueTrackUids.length
    //   const removalIndexArray = range(removalLength).map(
    //     (i) => i + startingRemovalIndex
    //   )
    //   await TrackPlayer.remove(removalIndexArray)
    //   await TrackPlayer.skip(queueIndex)
    //   return
    // }

    const newQueueTracks = isQueueAppend
      ? queueTracks.slice(refUids.length)
      : queueTracks

    const queryParamsMap = await handleGatedQueryParams(newQueueTracks)

    const newTrackData = newQueueTracks.map((track) => {
      const trackOwner = queueTrackOwnersMap[track.owner_id]
      const trackId = track.track_id
      const offlineTrackAvailable =
        trackId && isOfflineModeEnabled && offlineAvailabilityByTrackId[trackId]

      // Get Track url
      let url: string
      let isM3u8 = false
      if (offlineTrackAvailable && isCollectionMarkedForDownload) {
        const audioFilePath = getLocalAudioPath(trackId)
        url = `file://${audioFilePath}`
      } else if (isStreamMp3Enabled && isReachable) {
        const queryParams = queryParamsMap[track.track_id]
        if (queryParams) {
          url = apiClient.makeUrl(
            `/tracks/${encodeHashId(track.track_id)}/stream`,
            queryParams
          )
        } else {
          url = apiClient.makeUrl(
            `/tracks/${encodeHashId(track.track_id)}/stream`
          )
        }
      } else {
        isM3u8 = true
        const ownerGateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
          trackOwner.creator_node_endpoint
        )
        url = hlsUtils.generateM3U8Variants({
          segments: track.track_segments ?? [],
          gateways: ownerGateways
        })
      }

      const localTrackImageSource =
        isNotReachable && track
          ? { uri: `file://${getLocalTrackCoverArtPath(trackId.toString())}` }
          : undefined

      const imageUrl =
        getImageSourceOptimistic({
          cid: track ? track.cover_art_sizes || track.cover_art : null,
          user: trackOwner,
          size: SquareSizes.SIZE_1000_BY_1000,
          localSource: localTrackImageSource
        })?.uri ?? DEFAULT_IMAGE_URL

      return {
        url,
        type: isM3u8 ? TrackType.HLS : TrackType.Default,
        title: track.title,
        artist: trackOwner.name,
        genre: track.genre,
        date: track.created_at,
        artwork: imageUrl,
        duration: track?.duration
      }
    })

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
    queueTracks,
    didOfflineToggleChange,
    isCollectionMarkedForDownload,
    handleGatedQueryParams
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

  const handlePlaybackRateChange = useCallback(async () => {
    if (!isPodcastRef.current) return
    await TrackPlayer.setRate(playbackRateValueMap[playbackRate])
  }, [playbackRate])

  useEffect(() => {
    if (isAudioSetup) {
      handleRepeatModeChange()
    }
  }, [handleRepeatModeChange, repeatMode, isAudioSetup])

  useEffect(() => {
    if (isAudioSetup) {
      handleQueueChange()
    }
  }, [handleQueueChange, queueTrackUids, isAudioSetup])

  useEffect(() => {
    if (isAudioSetup) {
      handleQueueIdxChange()
    }
  }, [handleQueueIdxChange, queueIndex, isAudioSetup])

  useEffect(() => {
    if (isAudioSetup) {
      handleTogglePlay()
    }
  }, [handleTogglePlay, playing, isAudioSetup])

  useEffect(() => {
    handlePlaybackRateChange()
  }, [handlePlaybackRateChange, playbackRate])

  return null
}
