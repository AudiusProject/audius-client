import { h } from 'preact'

import cn from 'classnames'
import { useEffect } from 'preact/hooks'
import IconPause from '../../assets/img/iconPause.svg'
import IconPlay from '../../assets/img/iconPlay.svg'
import Spinner from '../spinner/Spinner'

import styles from './PlayButton.module.css'

export const PlayingState = Object.seal({
  Playing: 'PLAYING',
  Paused: 'PAUSED',
  Buffering: 'BUFFERING',
  Stopped: 'STOPPED'
})

// TODO: add proptypes
// interface PlayButtonProps {
//   playingState: PlayingState
//   onTogglePlay: () => void
//   onAfterPause: () => void
//   iconColor?: string
//   className?: string
// }


const PlayButton = ({
  playingState,
  onTogglePlay,
  iconColor,
  className
}) => {
  const stateIconMap = {
    [PlayingState.Playing]: <IconPause />,
    [PlayingState.Paused]: <IconPlay />,
    [PlayingState.Stopped]: <IconPlay />,
    [PlayingState.Buffering]: <Spinner className={styles.spinner} svgStyle={{ stroke: iconColor }} />
  }

  useEffect(() => {
    const root = document.getElementById('app')
    if (!root) { return }
    root.style.setProperty('--play-button-fill', iconColor)
  }, [])

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onTogglePlay()
      }}
      className={cn(styles.container, className, {
        [styles.isBuffering]: playingState === PlayingState.Buffering
      })}
    >
      {stateIconMap[playingState]}
    </div>
  )
}

export default PlayButton

