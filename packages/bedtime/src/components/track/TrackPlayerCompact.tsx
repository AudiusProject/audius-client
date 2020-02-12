import { Scrubber } from '@audius/stems'
import { h } from 'preact'

import PlayButton from '../PlayButton'
import { PlayingState } from '../PlayButton'

// TODO: return to icons

import styles, { trackInfo } from './TrackPlayerCompact.module.css'


interface TrackPlayerCompactProps {
  title: string
  handle: string
  playingState: PlayingState
  albumArtUrl: string
  isVerified: boolean
  position: number
  duration: number

  seekTo: (location: number) => void
  onTogglePlay: () => void
  onShare: () => void
}

const TrackPlayerCompact = ({
  title,
  handle,
  playingState,
  onTogglePlay,
  albumArtUrl,
  isVerified,
  position,
  duration,
  seekTo
}: TrackPlayerCompactProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.shareButton}/>
      <div className={styles.albumArt} style={{ backgroundImage: `url(${albumArtUrl})`}}/>
      <div className={styles.trackInfo}>
        <div className={styles.topSection}>
          <Scrubber
            // TODO: is this going to create trouble w multiple tracks
            // of the same name?
            mediaKey={title}
            isPlaying={playingState === PlayingState.Playing}
            isDisabled={playingState === PlayingState.Buffering} // TODO: disable here?
            isMobile={true}
            // includeTimestamps={false}
            onScrubRelease={seekTo}
            totalSeconds={duration}
            elapsedSeconds={position}
          />
        </div>
        <div className={styles.bottomSection}>
          <PlayButton
            playingState={playingState}
            onTogglePlay={onTogglePlay}
          />
          <div className={styles.titles}>
            <div className={styles.title}>
              {title}
            </div>
            <div className={styles.handle}>
              {handle}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackPlayerCompact
