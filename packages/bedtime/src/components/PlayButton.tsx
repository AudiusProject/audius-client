import { h } from 'preact'

import styles from './PlayButton.module.css'

export enum PlayingState {
  Playing = 'PLAYING',
  Paused = 'PAUSED',
  Buffering = 'BUFFERING'
}

interface PlayButtonProps {
  playingState: PlayingState
  onTogglePlay: () => void
}

const PlayButton = ({
  playingState,
  onTogglePlay
}: PlayButtonProps) => {
  return (
    <div onClick={onTogglePlay} className={styles.container}>
      {playingState === PlayingState.Playing ? 'Pause' : 'Play'}
    </div>
  )
}

export default PlayButton