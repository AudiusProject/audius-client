import { h } from 'preact'
import { useState, useContext } from 'preact/hooks'

import usePlayback from '../../hooks/usePlayback'
import { recordListen } from '../../util/BedtimeClient'
import CollectionPlayerCard from './CollectionPlayerCard'
import { PauseContext } from '../pausedpopover/PauseProvider'
import { useSpacebar } from '../../hooks/useSpacebar'
import { useRecordListens } from '../../hooks/useRecordListens'

const LISTEN_INTERVAL_SECONDS = 1

// TODO: Add proptypes
// interface CollectionPlayerContainerProps {
//   flavor: PlayerFlavor
//   collection: GetCollectionsResponse
// }

const CollectionPlayerContainer = (props) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [didInitAudio, setDidInitAudio] = useState(false)

  const getSegments = (i) => props.collection.tracks[i].segments

  // TODO: color
  const color = '#ED6C32'
  const rowBackgroundColor = '#d78f0c'

  const onTrackEnd = ({ stop, onTogglePlay, load }) => {
    if (activeTrackIndex === props.collection.tracks.length - 1) {
      setActiveTrackIndex(0)
      load(getSegments(0))
      // set a new track for logging a listen
      setNewTrackRef.current && setNewTrackRef.current()
      return
    }

    setActiveTrackIndex(i => i + 1)
    stop()
    load(getSegments(activeTrackIndex + 1))
    onTogglePlay()
  }

  const {
    playingState,
    duration,
    position,
    loadTrack,
    mediaKey,
    seekTo,
    onTogglePlay,
    play,
    stop,
    initAudio
  } = usePlayback(onTrackEnd)

  useRecordListens(position, mediaKey, props.collection.tracks[activeTrackIndex].id, LISTEN_INTERVAL_SECONDS)

  const onTogglePlayTrack = (trackIndex) => {
    console.log('running TOGGLE')
    if (!didInitAudio) {
      initAudio()
      loadTrack(getSegments(trackIndex))
      setDidInitAudio(true)
    }

    if (trackIndex === activeTrackIndex) {
      onTogglePlay()
      return
    }

    setActiveTrackIndex(trackIndex)
    stop()
    loadTrack(getSegments(trackIndex))
    onTogglePlay()
  }

  // Setup spacebar
  useSpacebar(() => onTogglePlayTrack(activeTrackIndex))

  const { pause } = useContext(PauseContext)

  return (
    <CollectionPlayerCard
      activeTrackIndex={activeTrackIndex}
      backgroundColor={color}
      rowBackgroundColor={rowBackgroundColor}
      collection={props.collection}
      duration={duration}
      elapsedSeconds={position}
      mediaKey={`${mediaKey}`}
      onTogglePlay={onTogglePlayTrack}
      playingState={playingState}
      seekTo={seekTo}
      onAfterPause={pause}
      isTwitter={props.isTwitter}
    />
  )
}

export default CollectionPlayerContainer
