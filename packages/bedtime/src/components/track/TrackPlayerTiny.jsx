import { h } from 'preact'
import cn from 'classnames'

import PlayButton, { PlayingState } from '../playbutton/PlayButton'
import styles from './TrackPlayerTiny.module.css'
import AudiusLogoGlyph from '../../assets/img/audiusLogoGlyph.svg'
import { getCopyableLink } from '../../util/shareUtil'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'

const MARQUEE_SPACING = 40
const SHOULD_ANIMATE_WIDTH_THRESHOLD = 15

const messages = {
  deleted: 'Track Deleted By Artist'
}

const TrackPlayerTiny = ({
  title,
  mediaKey,
  handle,
  artistName,
  trackURL,
  playingState,
  onTogglePlay,
  albumArtURL,
  isVerified
}) => {
  const info = `${title} • ${artistName}`

  const onClick = useCallback(() => {
    window.open(getCopyableLink(trackURL), '_blank')
  }, [trackURL])

  const infoRef = useRef(null)
  const containerRef = useRef(null)

  // Whether not the marquee animation should run
  const [animating, setAnimating] = useState(false)

  // How wide the info section is (computed from rendered text box size)
  const [infoWidth, setInfoWidth] = useState(null)

  // On first mount, record the computed width of the info section (title + artist)
  useEffect(() => {
    if (infoRef.current) {
      const computedInfoWidth = infoRef.current.getBoundingClientRect().width
      setInfoWidth(computedInfoWidth)
    }
  }, [infoRef, containerRef, setInfoWidth])

  // When playing and the info text is larger than the container, start the
  // marquee animation
  useEffect(() => {
    if (playingState === PlayingState.Playing) {
      if (infoRef.current && containerRef.current) {
        const computedContainerWidth = containerRef.current.getBoundingClientRect().width
        const computedInfoWidth = infoRef.current.getBoundingClientRect().width
        if (computedInfoWidth > computedContainerWidth - SHOULD_ANIMATE_WIDTH_THRESHOLD) {
          setAnimating(true)
        } 
      }
    } else {
      setAnimating(false)
    }
  }, [containerRef, animating, setAnimating, playingState])

  const infoStyle = {}
  if (infoWidth) {
    infoStyle["--info-width"] = `${infoWidth + MARQUEE_SPACING}px`
  }

  return (
    <div className={styles.wrapper}>
      <PlayButton
        playingState={playingState}
        onTogglePlay={onTogglePlay}
        className={styles.playButton}
      />
      <div
        className={styles.container}
        onClick={onClick}
        ref={containerRef}
      >
        <div className={styles.playContainer}>
        </div>
        <div className={styles.infoContainer}>
          <div
            className={cn(styles.info, {
              [styles.animating]: animating
            })}
            ref={infoRef}
            style={infoStyle}
          >
            {info}
          </div>
        </div>
        <div className={styles.logoContainer}>
          <AudiusLogoGlyph
            className={styles.logo}
          />
        </div>
      </div>
    </div>
  )
}

export default TrackPlayerTiny
