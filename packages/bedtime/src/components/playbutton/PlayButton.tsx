import { h } from 'preact'

import cn from 'classnames'
import { useEffect } from 'preact/hooks'
import IconPause from '../../assets/img/iconPause.svg'
import IconPlay from '../../assets/img/iconPlay.svg'

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

const stateIconMap = {
  [PlayingState.Playing]: <IconPause />,
  [PlayingState.Paused]: <IconPlay />,
  [PlayingState.Stopped]: <IconPlay />,
  [PlayingState.Buffering]: <IconPlay />  // TODO: swap this out with an actual buffering animation
}

const PlayButton = ({
  playingState,
  onTogglePlay,
  onAfterPause,
  iconColor,
  className
}) => {
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
        if (playingState === PlayingState.Playing) { onAfterPause() }
      }}
      className={cn(styles.container, className)}
    >
      {stateIconMap[playingState]}
    </div>
  )
}

export default PlayButton

