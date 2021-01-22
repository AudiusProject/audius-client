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

  // Helper fn to get segements
  const getSegments = useCallback((i) => collection.tracks[i].segments, [collection])
  const getId = useCallback((i) => collection.tracks[i].id, [collection])

  // callback for usePlayback
  const onTrackEnd = useCallback(({ stop, onTogglePlay, load }) => {
    // Handle last track case
    if (activeTrackIndex === collection.tracks.length - 1) {
      setActiveTrackIndex(0)
      load(getSegments(0))
      setPopoverVisibility(true)
      return
    }

    setActiveTrackIndex(i => i + 1)
    stop()
    load(getSegments(activeTrackIndex + 1))
    onTogglePlay()
  }, [activeTrackIndex, setActiveTrackIndex, collection, ])

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
  useRecordListens(position, mediaKey, collection.tracks[activeTrackIndex].id, LISTEN_INTERVAL_SECONDS)

  // Setup twitter autoplay
  useEffect(() => {
    const mobile = isMobile()
    if (!isTwitter || mobile || !collection.tracks.length) return
    initAudio()
    loadTrack(getSegments(0))
    setDidInitAudio(true)
    onTogglePlay()
  }, [])

  const onTogglePlayTrack = useCallback((trackIndex) => {
    if (!didInitAudio) {
      initAudio()
      loadTrack(getSegments(trackIndex))
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
    loadTrack(getSegments(trackIndex))
    onTogglePlay(getId(trackIndex))
  }, [didInitAudio, setDidInitAudio, loadTrack, activeTrackIndex, playingState, setPopoverVisibility, onTogglePlay, stop, getId])

  // Setup spacebar
  const spacebarEnabled = playingState !== PlayingState.Buffering && !popoverVisibility
  useSpacebar(() => onTogglePlayTrack(activeTrackIndex), spacebarEnabled)

  // Tiny flavor isn't allowed for collections
  if (flavor === PlayerFlavor.TINY) return null

  return (
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
  )
}

export default CollectionPlayerContainer
