import { h } from 'preact'
import Artwork from '../artwork/Artwork'
import AudiusLogoButton from '../button/AudiusLogoButton'
import ShareButton from '../button/ShareButton'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'

import styles from './TrackPlayerCard.module.css'

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
    <div className={styles.container}>
      <Artwork
        onClickURL={trackURL}
        artworkURL={albumArtURL} 
      />
      <BedtimeScrubber
        duration={duration}
        elapsedSeconds={position}
        mediaKey={`${mediaKey}`} 
        playingState={playingState}
        seekTo={seekTo}
      />
      <div className={styles.bottomSection}>
        <PlayButton
          onTogglePlay={onTogglePlay}
          playingState={playingState}
          iconColor={backgroundColor}
        />
        <Titles
          artistName={artistName}
          handle={handle}
          isVerified={isVerified}
          title={title}
          titleUrl={trackURL}
        />
      </div>
    </div>
  )
}

export default TrackPlayerCard
