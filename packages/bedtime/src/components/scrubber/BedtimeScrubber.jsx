import { Scrubber } from '@audius/stems'
import { h } from 'preact'

import { useEffect } from 'preact/hooks'
import { PlayingState } from '../playbutton/PlayButton'
import styles from './BedtimeScrubber.module.css'

const RAIL_LISTENED_COLOR = 'rgba(255, 255, 255, 0.8)'
const RAIL_UNLISTENED_COLOR = 'rgba(255, 255, 255, 0.1)'
const RAIL_HOVER_COLOR = 'rgba(255, 255, 255, 1)'
const HANDLE_COLOR = 'rgba(255, 255, 255, 1)'
const HANDLE_SHADOW = '0 0 2px 0 rgba(133,129,153,0.5), 0 2px 5px -1px rgba(133,129,153,0.5)'

const EmbedScrubber = ({
  mediaKey,
  playingState,
  seekTo,
  duration,
  elapsedSeconds,
  includeExpandedTargets = true,
  railListenedColor = RAIL_LISTENED_COLOR,
  railUnlistenedColor = RAIL_UNLISTENED_COLOR,
  railHoverColor = RAIL_HOVER_COLOR,
  handleColor = HANDLE_COLOR,
  handleShadow = HANDLE_SHADOW
}) => {

  // Gross hack:
  // Stems relies on a :before pseudo selector to style
  // the rail hover color. We manually set that here.
  useEffect(() => {
    const root = document.getElementById('app')
    if (!root) { return }
    root.style.setProperty('--scrubber-hover', railHoverColor)
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
        includeExpandedTargets={includeExpandedTargets}
        style={{
          railListenedColor,
          railUnlistenedColor,
          showHandle: false,
          handleColor,
          handleShadow,
          sliderMargin: `0px`
        }}
      />
    </div>
  )
}

export default EmbedScrubber
