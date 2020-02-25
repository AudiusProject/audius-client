import { h } from 'preact'
import Artwork from '../artwork/Artwork'
import ShareButton from '../button/ShareButton'
import PlayButton from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'
import Card from '../card/Card'

import styles from './TrackPlayerCard.module.css'

import cardStyles from '../collection/CollectionPlayerCard.module.css'
import { Flavor } from '../pausedpopover/PausePopover'

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
  backgroundColor,
  isTwitter,
}) => {

  return (
    <Card
      isTwitter={isTwitter}
      backgroundColor={backgroundColor}
      twitterURL={trackURL}
    >
      <div className={styles.paddingContainer}>
        <div className={styles.artworkWrapper}>
          <Artwork
            onClickURL={trackURL}
            artworkURL={albumArtURL}
            className={styles.artworkStyle}
            displayHoverPlayButton={true}
            onTogglePlay={onTogglePlay}
            playingState={playingState}
            iconColor={backgroundColor}
          />
        </div>
        <div className={styles.bottomWrapper}>
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
                creator={artistName}
                title={title}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default TrackPlayerCard
