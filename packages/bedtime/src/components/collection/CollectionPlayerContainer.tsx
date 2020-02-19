import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import usePlayback, { OnAfterAudioEndArguments } from '../../hooks/usePlayback'
import { GetCollectionsResponse } from '../../util/BedtimeClient'
import { PlayerFlavor } from '../app'
import CollectionPlayerCard from './CollectionPlayerCard'

interface CollectionPlayerContainerProps {
  flavor: PlayerFlavor
  collection: GetCollectionsResponse
}

const CollectionPlayerContainer = (props: CollectionPlayerContainerProps) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [didInitAudio, setDidInitAudio] = useState(false)

  const getSegments = (i: number) => props.collection.tracks[i].segments

  // TODO: color
  const color = 'orange'
  const rowBackgroundColor = '#d78f0c'

  const onTrackEnd = ({ stop, onTogglePlay, load }: OnAfterAudioEndArguments) => {
    if (activeTrackIndex === props.collection.tracks.length - 1) {
      setActiveTrackIndex(0)
      load(getSegments(0))
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

  const onTogglePlayTrack = (trackIndex: number) => {
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

  // TODO: mediakey just a string, does this work?

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
    />
  )
}

export default CollectionPlayerContainer
