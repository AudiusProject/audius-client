import { h } from 'preact'
import { useState, useRef, useCallback } from 'preact/hooks'
import Artwork from '../artwork/Artwork'
import AudiusLogoButton from '../button/AudiusLogoButton'
import ShareButton from '../button/ShareButton'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'
import BedtimeScrubber from '../scrubber/BedtimeScrubber'
import Titles from '../titles/Titles'
import TwitterFooter from '../twitterfooter/TwitterFooter'

import styles from './TrackPlayerCard.module.css'

// TODO: move this important into a shared thingy
import cardStyles from '../collection/CollectionPlayerCard.module.css'
import { Flavor } from '../pausedpopover/PausePopover'

// TODO: props
// interface TrackPlayerCardProps {
//   title: string
//   mediaKey: number
//   artistName: string
//   handle: string
//   trackURL: string
//   playingState: PlayingState
//   albumArtURL: string
//   isVerified: boolean
//   position: number
//   duration: number
//   backgroundColor: string

//   seekTo: (location: number) => void
//   onTogglePlay: () => void
//   onShare: () => void
// }

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
  onAfterPause
}) => {

  const [cardStyle, setCardStyle] = useState({})

  const callbackRef = useCallback((element) => {
    if (!element) return

    const aspectRatio = isTwitter ? 0.728 : 0.833
    const viewportAspectRatio = (window.document.body.clientWidth / window.document.body.clientHeight)
    console.log({viewportAspectRatio})

    // TODO: return when I have brainpower
    // Viewport is wider
    if (aspectRatio < viewportAspectRatio) {
      // In this case, we have 'extra' width so height is the constraining factor
      console.log('In case 1')
      console.log({clientHeight: element.parentElement.clientHeight})
      setCardStyle({
        height: `${element.parentElement.clientHeight}px`,
        width: `${element.parentElement.clientHeight * aspectRatio}px`
      })
    } else {
      setCardStyle({
        height: `${element.parentElement.clientWidth / aspectRatio}px`,
        width: `${element.parentElement.clientWidth}px`
      })
      console.log('CASE 2')
      // Here we have extra height, so constrain by width
    }
  }, [setCardStyle])

  console.log({style2: cardStyle })

  const getDropshadow = () => (isTwitter ? { boxShadow: '0 3px 34px 0 rgba(0, 0 ,0, 0.25)' } : {})

  // TODO: Figure out what media key should be for the scrubber
  return (
    <div
      className={styles.container}
      style={{
        backgroundColor,
        ...cardStyle,
        ...getDropshadow()
      }}
      ref={callbackRef}>
      <div className={styles.paddingContainer}>
        <div className={styles.artworkWrapper}>
          <Artwork
            onClickURL={trackURL}
            artworkURL={albumArtURL}
            className={styles.artworkStyle}
            displayHoverPlayButton={true}
            onAfterPause={onAfterPause}
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
              onAfterPause={onAfterPause}
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
    {
      isTwitter && <div className={styles.twitterContainer}>
        <TwitterFooter onClickPath={trackURL} />
      </div>
    }
    </div>
  )
}

export default TrackPlayerCard
