import { h } from 'preact'
import { useState, useContext, useEffect } from 'preact/hooks'

import usePlayback from '../../hooks/usePlayback'
import { recordListen } from '../../util/BedtimeClient'
import CollectionPlayerCard from './CollectionPlayerCard'
import { PauseContext } from '../pausedpopover/PauseProvider'
import { useSpacebar } from '../../hooks/useSpacebar'
import { useRecordListens } from '../../hooks/useRecordListens'
import { getDominantColor } from '../../util/image/dominantColor'
import { shadeColor } from '../../util/shadeColor'

const LISTEN_INTERVAL_SECONDS = 1

// TODO: Add proptypes
// interface CollectionPlayerContainerProps {
//   flavor: PlayerFlavor
//   collection: GetCollectionsResponse
// }

const CollectionPlayerContainer = ({
  collection,
  isTwitter
}) => {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0)
  const [didInitAudio, setDidInitAudio] = useState(false)

  const getSegments = (i) => collection.tracks[i].segments

  // TODO: color
  const [backgroundColor, setBackgroundColor] = useState('')
  const [rowBackgroundColor, setRowBackgroundColor] = useState('')

  useEffect(() => {
    const a = async () => {
      if (collection) {
        const color = await getDominantColor(collection.coverArt)
        setBackgroundColor(color)
        setRowBackgroundColor(shadeColor(color, -20))
      }
    }
    a()
  }, [collection, setBackgroundColor])


  const onTrackEnd = ({ stop, onTogglePlay, load }) => {
    if (activeTrackIndex === collection.tracks.length - 1) {
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

  useRecordListens(position, mediaKey, collection.tracks[activeTrackIndex].id, LISTEN_INTERVAL_SECONDS)

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
      backgroundColor={backgroundColor}
      rowBackgroundColor={rowBackgroundColor}
      collection={collection}
      duration={duration}
      elapsedSeconds={position}
      mediaKey={`${mediaKey}`}
      onTogglePlay={onTogglePlayTrack}
      playingState={playingState}
      seekTo={seekTo}
      onAfterPause={pause}
      isTwitter={isTwitter}
    />
  )
}

export default CollectionPlayerContainer
