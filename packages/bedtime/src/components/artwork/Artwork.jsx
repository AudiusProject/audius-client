import cn from 'classnames'
import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { getAudiusURL } from '../../util/shareUtil'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'

import styles from './Artwork.module.css'

// interface ArtworkProps {
//   onClickURL: string
//   artworkURL: string
//   className?: string
//   displayHoverPlayButton?: boolean
//   onAfterPause?: () => void
//   onTogglePlay?: () => void
//   playingState?: PlayingState
//   iconColor?: string
// }

const preloadImage = (url, callback) => {
  const img = new Image()
  img.onload = callback
  img.onerror = (e) => {
    resolve('')
  }
  img.src = url
}

const usePreloadImage = (url) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  useEffect(() => {
    if (url && !imageLoaded) {
      preloadImage(url, () => setImageLoaded(true))
    }
  }, [url, imageLoaded, setImageLoaded])

  return imageLoaded
}

const Artwork = ({
  onClickURL,
  artworkURL,
  className,
  displayHoverPlayButton = false,
  onAfterPause = () => {},
  onTogglePlay = () => {},
  playingState = PlayingState.Playing,
  iconColor = '#ffffff'
}) => {
  const onClick = () => {
    window.open(`${getAudiusURL()}/${onClickURL}`, '_blank')
  }

  const [isHovering, setIsHovering] = useState(false)
  
  const onClickWrapper = () => {
    onTogglePlay()
    if (playingState === PlayingState.Playing) {
      onAfterPause()
    }
  }

  const hasImageLoaded = usePreloadImage(artworkURL)
  
  return (
    <div
      className={cn(styles.container, {
        [styles.hasLoaded]: hasImageLoaded
      })}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {displayHoverPlayButton &&
       <div
         className={styles.playButtonWrapper}
         onClick={onClickWrapper}
       >
          <PlayButton
            className={styles.playButton}
            onAfterPause={onAfterPause}
            onTogglePlay={onTogglePlay}
            playingState={playingState}
            iconColor={iconColor}
          />
        </div>
      }
      <div
        onClick={onClick}
        className={cn(styles.albumArt, className)}
        style={{ backgroundImage: hasImageLoaded ? `url(${artworkURL})` : '' }}
      />
    </div>
  )
}

// TODO: proptypes
// Artwork.propTypes = {
//   onClickURL: PropTypes.string
//   artworkURL: PropTypes.string
//   className: PropTypes.string
//   displayHoverPlayButton?: boolean
//   onAfterPause?: () => void
//   onTogglePlay?: () => void
//   playingState?: PlayingState
//   iconColor?: string

// }

export default Artwork

