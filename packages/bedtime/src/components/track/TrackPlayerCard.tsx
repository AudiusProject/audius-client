import { h } from 'preact'
import Artwork from '../artwork/Artwork'
import AudiusLogoButton from '../button/AudiusLogoButton'
import ShareButton from '../button/ShareButton'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'

import styles from './TrackPlayerCard.module.css'

// TODO: move this important into a shared thingy
import cardStyles from '../collection/CollectionPlayerCard.module.css'


interface TrackPlayerCardProps {
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
  backgroundColor: string

  seekTo: (location: number) => void
  onTogglePlay: () => void
  onShare: () => void
}

const TrackPlayerCard = ({
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
  seekTo,
  backgroundColor
}: TrackPlayerCardProps) => {
  // TODO: Figure out what media key should be for the scrubber
  return (
    <div className={styles.container} style={{backgroundColor}}>
      <Artwork
        onClickURL={trackURL}
        artworkURL={albumArtURL} 
        className={styles.artworkStyle}
      />
      <div className={styles.scrubber}>
        <BedtimeScrubber
          duration={duration}
          elapsedSeconds={position}
          mediaKey={`${mediaKey}`} 
          playingState={playingState}
          seekTo={seekTo}
        />
      </div>
      <div className={styles.bottomSection}>
        <PlayButton
          onTogglePlay={onTogglePlay}
          playingState={playingState}
          iconColor={backgroundColor}
          className={styles.playButton}
        />
        <Titles
          artistName={artistName}
          handle={handle}
          isVerified={isVerified}
          title={title}
          titleUrl={trackURL}
        />
        <div className={styles.shareWrapper}>
          <ShareButton
            url={trackURL}
          />
        </div>
      </div>
    </div>
  )
}

export default TrackPlayerCard
