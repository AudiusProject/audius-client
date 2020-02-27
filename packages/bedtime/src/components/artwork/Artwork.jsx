import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { getAudiusURL } from '../../util/shareUtil'
import cn from 'classnames'
import PlayButton, { PlayingState } from '../playbutton/PlayButton'

import styles from './Artwork.module.css'
import audiusLogo from '../../assets/img/logoEmbedPlayer.png'

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

const getWrapperTint = (rgbString) => `${rgbString.slice(0, rgbString.length - 1)}, 0.5)`

const Artwork = ({
  onClickURL,
  artworkURL,
  className,
  containerClassName,
  displayHoverPlayButton = false,
  onTogglePlay = () => {},
  playingState = PlayingState.Playing,
  iconColor = '#ffffff',
  isLargeFlavor = false,
  showLogo = false
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
        },
        containerClassName
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      { showLogo && <div
        className={styles.logoWrapper}
        style={{
          background: `url(${audiusLogo})`,
          opacity: isHovering ? 1 : 0.6
        }}
        /> }
      {displayHoverPlayButton &&
       <div
         className={styles.playButtonWrapper}
         onClick={onClickWrapper}
         style={{
           backgroundColor: `${getWrapperTint(iconColor)}`
         }}
       >
          <PlayButton
            className={cn({ [styles.playButtonLarge]: isLargeFlavor })}
            onTogglePlay={onTogglePlay}
            playingState={playingState}
            iconColor={getWrapperTint(iconColor)}
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
