import { h } from 'preact'

import PlayButton, { PlayingState } from '../playbutton/PlayButton'

// TODO: return to icons

import Artwork from '../artwork/Artwork'
import AudiusLogoButton from '../button/AudiusLogoButton'
import ShareButton from '../button/ShareButton'
import EmbedScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'
import styles from './TrackPlayerCompact.module.css'

interface TrackPlayerCompactProps {
  title: string
  mediaKey: number
  artistName: string
  handle: string
  trackURL: string
  playingState: PlayingState
  albumArtURL: string
  isVerified: boolean
  position: number
  duration: number

  seekTo: (location: number) => void
  onTogglePlay: () => void
  onShare: () => void
}

const TrackPlayerCompact = ({
  title,
  mediaKey,
  handle,
  artistName,
  trackURL,
  playingState,
  onTogglePlay,
  albumArtURL,
  isVerified,
  position,
  duration,
  seekTo
}: TrackPlayerCompactProps) => {
  console.log({position, duration})
  return (
    <div className={styles.container}>
      <div className={styles.shareButton}/>
      <Artwork
        artworkURL={albumArtURL}
        onClickURL={trackURL}
      />
      <div className={styles.trackInfo}>
        <div className={styles.topSection}>
          <EmbedScrubber
            mediaKey={`title-${mediaKey}`}
            playingState={playingState}
            seekTo={seekTo}
            duration={duration}
            elapsedSeconds={position}
          />
          <div className={styles.logo}>
            <AudiusLogoButton />
          </div>
        </div>
        <div className={styles.bottomSection}>
          <PlayButton
            playingState={playingState}
            onTogglePlay={onTogglePlay}
            iconColor={'orange'} // TODO: avg color
          />
          <Titles
            title={title}
            artistName={artistName}
            handle={handle}
            isVerified={isVerified}
            titleUrl={trackURL}
          />
          <div className={styles.shareButtonHolder}>
            <ShareButton
              url={trackURL}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackPlayerCompact
