import { Scrubber } from '@audius/stems'
import { h } from 'preact'

import { useEffect } from 'preact/hooks'
import { PlayingState } from '../playbutton/PlayButton'
import styles from './BedtimeScrubber.module.css'

const RAIL_LISTENED_COLOR = 'rgba(255, 255, 255, 0.8)'
const RAIL_UNLISTENED_COLOR = 'rgba(255, 255, 255, 0.1)'
const RAIL_HOVER_COLOR = 'rgba(255, 255, 255, 1)'

const EmbedScrubber = ({
  mediaKey,
  playingState,
  seekTo,
  duration,
  elapsedSeconds,
}) => {

  // Gross hack:
  // Stems relies on a :before pseudo selector to style
  // the rail hover color. We manually set that here.
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
        isDisabled={playingState === PlayingState.Stopped}
        isMobile={true}
        includeTimestamps={false}
        onScrubRelease={seekTo}
        totalSeconds={duration}
        elapsedSeconds={elapsedSeconds}
        style={{
          railListenedColor: RAIL_LISTENED_COLOR,
          railUnlistenedColor: RAIL_UNLISTENED_COLOR,
          showHandle: false,
          sliderMargin: `0px`
        }}
      />
    </div>
  )
}

export default EmbedScrubber
