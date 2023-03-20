import {
  FeatureFlags,
  ID,
  playbackPositionSelectors,
  CommonState
} from '@audius/common'
import { Button, ButtonType, IconPause, IconPlay } from '@audius/stems'
import { useSelector } from 'react-redux'

import { ReactComponent as IconRepeat } from 'assets/img/iconRepeatOff.svg'
import { useFlag } from 'hooks/useRemoteConfig'

import styles from './GiantTrackTile.module.css'

const { getTrackPosition } = playbackPositionSelectors

type PlayPauseButtonProps = {
  doesUserHaveAccess: boolean
  playing: boolean
  trackId?: ID
  onPlay: () => void
}

const messages = {
  play: 'play',
  pause: 'pause',
  resume: 'resume',
  replay: 'replay'
}

export const PlayPauseButton = ({
  doesUserHaveAccess,
  playing,
  trackId,
  onPlay
}: PlayPauseButtonProps) => {
  const { isEnabled: isGatedContentEnabled } = useFlag(
    FeatureFlags.GATED_CONTENT_ENABLED
  )
  const { isEnabled: isNewPodcastControlsEnabled } = useFlag(
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED
  )

  const trackPlaybackInfo = useSelector((state: CommonState) =>
    getTrackPosition(state, { trackId })
  )

  const playText =
    isNewPodcastControlsEnabled && trackPlaybackInfo
      ? trackPlaybackInfo.status === 'IN_PROGRESS'
        ? messages.resume
        : messages.replay
      : messages.play

  const playIcon =
    isNewPodcastControlsEnabled && trackPlaybackInfo?.status === 'COMPLETED' ? (
      <IconRepeat />
    ) : (
      <IconPlay />
    )

  return (
    <Button
      name='play'
      className={styles.playButton}
      textClassName={styles.playButtonText}
      type={ButtonType.PRIMARY_ALT}
      text={playing ? messages.pause : playText}
      leftIcon={playing ? <IconPause /> : playIcon}
      onClick={onPlay}
      disabled={isGatedContentEnabled ? !doesUserHaveAccess : false}
    />
  )
}
