import { h } from 'preact'
import { useState, useCallback, useContext, useEffect } from 'preact/hooks'
import Artwork from '../artwork/Artwork'
import ShareButton from '../button/ShareButton'
import PlayButton from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'
import Card, { CardDimensionsContext } from '../card/Card'

import styles from './TrackPlayerCard.module.css'

import cardStyles from '../collection/CollectionPlayerCard.module.css'
import { Flavor } from '../pausedpopover/PausePopover'
import { isMobileWebTwitter } from '../../util/isMobileWebTwitter'
import AudiusLogo from '../pausedpopover/AudiusLogo'

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

  const mobileWebTwitter = isMobileWebTwitter(isTwitter)
  const getBottomWrapperStyle = () => mobileWebTwitter ? { flex: '0 0 84px' } : {}
  const [artworkWrapperStyle, setArtworkWrapperStyle] = useState({
    // Need to start the wrapper with 0
    // opacity bc it doesn't have valid
    // size information until the
    // cardDimensionsContext gives us
    // non-zero values post-mount.
    opacity: 0
  })
  const { height, width } = useContext(CardDimensionsContext)

  useEffect(() => {
    if (width === 0 ) return
    // 124px: 84px bottom component, 18 px bottom margin, 24px top margin
    const desiredHeight = height - 124
    // 48 width to account for horizontal margins
    const maxWidth = width - 48
    const side = Math.min(desiredHeight, maxWidth)
    const newStyle = {
      width: `${side}px`,
      height: `${side}px`,
      marginLeft: 'auto',
      marginRight: 'auto',
      opacity: 1,
    }
    setArtworkWrapperStyle(newStyle)
  }, [height, width])

  return (
    <Card
      isTwitter={isTwitter}
      backgroundColor={backgroundColor}
      twitterURL={trackURL}
    >
      <div className={styles.paddingContainer}>
        <div
          className={styles.artworkWrapper}
          style={artworkWrapperStyle}
        >
          <Artwork
            onClickURL={trackURL}
            artworkURL={albumArtURL}
            className={styles.artworkStyle}
            containerClassName={styles.artworkContainer}
            displayHoverPlayButton={true}
            onTogglePlay={onTogglePlay}
            playingState={playingState}
            iconColor={backgroundColor}
            isLargeFlavor
            showLogo
          />
        </div>
        <div
          className={styles.bottomWrapper}
          style={getBottomWrapperStyle()}
        >
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
            <div className={styles.titlesWrapper}>
              <Titles
                artistName={artistName}
                handle={handle}
                isVerified={isVerified}
                title={title}
                titleUrl={trackURL}
              />
            </div>
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
