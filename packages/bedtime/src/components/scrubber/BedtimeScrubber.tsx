import { Scrubber } from '@audius/stems'
import { h } from 'preact'

import { useEffect } from 'preact/hooks'
import { PlayingState } from '../playbutton/PlayButton'
import styles from './BedtimeScrubber.module.css'

const RAIL_LISTENED_COLOR = 'rgba(255, 255, 255, 0.8)'
const RAIL_UNLISTENED_COLOR = 'rgba(255, 255, 255, 0.1)'
const RAIL_HOVER_COLOR = 'rgba(255, 255, 255, 1)'


interface EmbedScrubberProps {
  mediaKey: string
  playingState: PlayingState
  seekTo: (location: number) => void
  duration: number
  elapsedSeconds: number
}

const EmbedScrubber = ({
  mediaKey,
  playingState,
  seekTo,
  duration,
  elapsedSeconds,
}: EmbedScrubberProps) => {

  // TODO fix this gross hack:
  // Stems relies on a :before pseudo selector to style 
  // the rail hover color. The fix is to break the dependence 
  // between stems and the dapp color set.
  useEffect(() => {
    const root = document.getElementById('app')
    if (!root) { return }
    root.style.setProperty('--scrubber-hover', RAIL_HOVER_COLOR)
  }, [])

  return (
    <div className={styles.container}>
      <Scrubber
        mediaKey={mediaKey}
        isPlaying={playingState === PlayingState.Playing}
        isDisabled={playingState === PlayingState.Buffering} // TODO: disable here?
        isMobile={true}
        includeTimestamps={false}
        onScrubRelease={seekTo}
        totalSeconds={duration}
        elapsedSeconds={elapsedSeconds}
        style={{
          railListenedColor: RAIL_LISTENED_COLOR,
          railUnlistenedColor: RAIL_UNLISTENED_COLOR,
          showHandle: false
        }}
      />
    </div>
  )
}

export default EmbedScrubber
