import { h } from 'preact'
import { useState, useCallback } from 'preact/hooks'
import Artwork from '../artwork/Artwork'
import ShareButton from '../button/ShareButton'
import PlayButton from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'
import Card from '../card/Card'

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
  const [artworkWrapperStyle, setArtworkWrapperStyle] = useState({})
  const artworkWrapperCallbackRef = useCallback((element) => {
    if (!mobileWebTwitter || !element) return
    const width = element.clientHeight
    console.log({element})
    console.log('Setting width:' + width)
    setArtworkWrapperStyle({
      width: `calc(100vh - 120px)`,
      marginLeft: 'auto',
      marginRight: 'auto'
     })
  }, [mobileWebTwitter, setArtworkWrapperStyle])

  return (
    <Card
      isTwitter={isTwitter}
      backgroundColor={backgroundColor}
      twitterURL={trackURL}
    >
      <div className={styles.paddingContainer}>
        <div
          className={styles.artworkWrapper}
          ref={artworkWrapperCallbackRef}
          style={artworkWrapperStyle}
        >
          <Artwork
            onClickURL={trackURL}
            artworkURL={albumArtURL}
            className={styles.artworkStyle}
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
