import { h } from 'preact'
import { useState, useContext, useCallback, useEffect } from 'preact/hooks'
import usePlayback from '../../hooks/usePlayback'
import CollectionPlayerCard from './CollectionPlayerCard'
import { PauseContext } from '../pausedpopover/PauseProvider'
import { useSpacebar } from '../../hooks/useSpacebar'
import { useRecordListens } from '../../hooks/useRecordListens'
import { PlayingState } from '../playbutton/PlayButton'
import { isMobile } from '../../util/isMobile'
import { PlayerFlavor } from '../app'
import { formatGateways } from '../../util/gatewayUtil'
import CollectionHelmet from './CollectionHelmet'
import { getTrackStreamEndpoint } from '../../util/BedtimeClient'

const LISTEN_INTERVAL_SECONDS = 1

const CollectionPlayerContainer = ({
  flavor,
  collection,
  isTwitter,
  backgroundColor,
  rowBackgroundColor
}) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [didInitAudio, setDidInitAudio] = useState(false)
  const { popoverVisibility, setPopoverVisibility } = useContext(PauseContext)

  const getId = useCallback((i) => collection.tracks[i]?.id, [collection])

  const getTrackInfoForPlayback = useCallback(
    (trackIndex) => {
      const activeTrack = collection.tracks[trackIndex]
      if (activeTrack == null) {
        return null
      }
      const mp3StreamUrl = getTrackStreamEndpoint(activeTrack.id)

      return {
        segments: activeTrack.trackSegments,
        gateways: formatGateways(activeTrack.user.creatorNodeEndpoint),
        title: activeTrack.title,
        artistName: activeTrack.user.name,
        mp3StreamUrl
      }
    },
    [collection.tracks]
  )

  // callback for usePlayback
  const onTrackEnd = useCallback(
    ({ stop, onTogglePlay, load }) => {
      // Handle last track case
      if (activeTrackIndex === collection.tracks.length - 1) {
        setActiveTrackIndex(0)
        load(getTrackInfoForPlayback(0))
        setPopoverVisibility(true)
        return
      }

      const newTrackIndex = activeTrackIndex + 1
      stop()
      load(getTrackInfoForPlayback(newTrackIndex))
      setActiveTrackIndex(newTrackIndex)
      onTogglePlay()
    },
    [
      activeTrackIndex,
      collection.tracks.length,
      setPopoverVisibility,
      getTrackInfoForPlayback
    ]
  )

  // Setup audio
  const {
    playingState,
    duration,
    position,
    loadTrack,
    mediaKey,
    seekTo,
    onTogglePlay,
    stop,
    initAudio
  } = usePlayback(getId(activeTrackIndex), onTrackEnd)

  // Setup recording listens
  useRecordListens(
    position,
    mediaKey,
    collection.tracks[activeTrackIndex]?.id,
    LISTEN_INTERVAL_SECONDS
  )

  // Setup twitter autoplay
  useEffect(() => {
    const mobile = isMobile()
    if (!isTwitter || mobile || !collection.tracks.length) return
    initAudio()
    loadTrack(getTrackInfoForPlayback(activeTrackIndex))
    setDidInitAudio(true)
    onTogglePlay()
    // TODO: Fix these deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onTogglePlayTrack = useCallback(
    (trackIndex) => {
      const trackInfoForPlayback = getTrackInfoForPlayback(trackIndex)
      if (!didInitAudio) {
        initAudio()
        loadTrack(trackInfoForPlayback)
        setDidInitAudio(true)
      }

      if (trackIndex === activeTrackIndex) {
        // Only show popover if we just toggled the already
        // active track
        if (playingState === PlayingState.Playing) {
          setPopoverVisibility(true)
        }

        onTogglePlay()
        return
      }

      setActiveTrackIndex(trackIndex)
      stop()
      loadTrack(trackInfoForPlayback)
      onTogglePlay(getId(trackIndex))
    },
    // TODO: Fix these deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      didInitAudio,
      setDidInitAudio,
      loadTrack,
      activeTrackIndex,
      playingState,
      setPopoverVisibility,
      onTogglePlay,
      stop,
      getId,
      getTrackInfoForPlayback
    ]
  )

  // Setup spacebar
  const spacebarEnabled =
    playingState !== PlayingState.Buffering && !popoverVisibility
  useSpacebar(() => onTogglePlayTrack(activeTrackIndex), spacebarEnabled)

  // Tiny flavor isn't allowed for collections
  if (flavor === PlayerFlavor.TINY) return null

  return (
    <>
      <CollectionHelmet collection={collection} />
      <CollectionPlayerCard
        activeTrackIndex={activeTrackIndex}
        backgroundColor={backgroundColor}
        rowBackgroundColor={rowBackgroundColor}
        collection={collection}
        duration={duration}
        elapsedSeconds={position}
        mediaKey={`${mediaKey}`}
        onTogglePlay={onTogglePlayTrack}
        playingState={playingState}
        seekTo={seekTo}
        isTwitter={isTwitter}
      />
    </>
  )
}

export default CollectionPlayerContainer
