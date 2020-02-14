import { h } from 'preact'

import { useEffect } from 'preact/hooks'
import IconPause from '../../assets/img/iconPause.svg'
import IconPlay from '../../assets/img/iconPlay.svg'

import styles from './PlayButton.module.css'

export enum PlayingState {
  Playing = 'PLAYING',
  Paused = 'PAUSED',
  Buffering = 'BUFFERING',
  Stopped = 'STOPPED'
}

interface PlayButtonProps {
  playingState: PlayingState
  onTogglePlay: () => void
  iconColor?: string
}

const stateIconMap = {
  [PlayingState.Playing]: <IconPause />,
  [PlayingState.Paused]: <IconPlay />,
  [PlayingState.Stopped]: <IconPlay />,
  [PlayingState.Buffering]: <IconPlay />  // TODO: swap this out with an actual buffering animation
}

const PlayButton = ({
  playingState,
  onTogglePlay,
  iconColor
}: PlayButtonProps) => {
  useEffect(() => {
    const root = document.getElementById('app')
    if (!root) { return }
    root.style.setProperty('--play-button-fill', iconColor)
  }, [])

  return (
    <div onClick={onTogglePlay} className={styles.container}>
      {stateIconMap[playingState]}
    </div>
  )
}

export default PlayButton

