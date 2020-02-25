import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { getAudiusURL } from '../../util/shareUtil'
import cn from 'classnames'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'

import styles from './Artwork.module.css'

export const DEFAULT_IMAGE = 'https://download.audius.co/static-resources/preview-image.jpg'

const preloadImage = (url, callback, onError) => {
  const img = new Image()
  img.onload = callback
  img.onerror = (e) => {
    console.error(e)
    onError()
  }
  img.src = url
}

const usePreloadImage = (url) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hasErrored, setHasErrored] = useState(false)
  useEffect(() => {
    if (url && !imageLoaded) {
      preloadImage(
        url,
        () => setImageLoaded(true),
        () => setHasErrored(true)
      )
    }
  }, [url, imageLoaded, setImageLoaded, setHasErrored])

  return [imageLoaded, hasErrored]
}

const Artwork = ({
  onClickURL,
  artworkURL,
  className,
  displayHoverPlayButton = false,
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
  }

  const [hasImageLoaded, hasImageErrored] = usePreloadImage(artworkURL)
  if (hasImageErrored) artworkURL = DEFAULT_IMAGE

  return (
    <div
      className={cn(styles.container, {
        [styles.hasLoaded]: hasImageLoaded || hasImageErrored
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
            onTogglePlay={onTogglePlay}
            playingState={playingState}
            iconColor={iconColor}
          />
        </div>
      }
      <div
        onClick={onClick}
        className={cn(styles.albumArt, className)}
        style={{ backgroundImage: hasImageLoaded || hasImageErrored ? `url(${artworkURL})` : '' }}
      />
    </div>
  )
}

export default Artwork
