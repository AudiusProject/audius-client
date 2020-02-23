import { h } from 'preact'
import { useEffect, useState, useRef } from 'preact/hooks'

import usePlayback, { OnAfterAudioEndArguments } from '../../hooks/usePlayback'
import { recordListen } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'
import CollectionPlayerCard from './CollectionPlayerCard'
import { PauseContext } from '../pausedpopover/PauseProvider'

const LISTEN_INTERVAL_SECONDS = 1

// TODO: Add proptypes
// interface CollectionPlayerContainerProps {
//   flavor: PlayerFlavor
//   collection: GetCollectionsResponse
// }

const useRecordListens = (position, listenId, trackId, listenThresholdSec) => {
  const [lastListenId, setLastListenId] = useState(null)

  if (position > listenThresholdSec && listenId !== lastListenId) {
    setLastListenId(listenId)
    console.log('RECORDING PLAY!')
    recordListen(trackId)
  }
}

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

  useRecordListens(position, mediaKey, props.collection.tracks[activeTrackIndex].id ,LISTEN_INTERVAL_SECONDS)
  
  const onTogglePlayTrack = (trackIndex) => {
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

  const { pause, unpause } = useContext(PauseContext)

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
    />
  )
}

export default CollectionPlayerContainer
