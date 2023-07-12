import {
  FeatureFlags,
  ID,
  accountSelectors,
  playerSelectors,
  playbackPositionSelectors,
  CommonState
} from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconPause,
  IconPlay
} from '@audius/stems'
import { useSelector } from 'react-redux'

import { ReactComponent as IconRepeat } from 'assets/img/iconRepeatOff.svg'
import { useFlag } from 'hooks/useRemoteConfig'

const { getUserId } = accountSelectors
const { getTrackId } = playerSelectors
const { getTrackPosition } = playbackPositionSelectors

type PlayPauseButtonProps = {
  doesUserHaveAccess: boolean
  isPreview?: boolean
  playing: boolean
  trackId?: ID
  onPlay: () => void
}

const messages = {
  play: 'play',
  preview: 'preview',
  pause: 'pause',
  resume: 'resume',
  replay: 'replay'
}

export const PlayPauseButton = ({
  doesUserHaveAccess,
  isPreview = false,
  playing,
  trackId,
  onPlay
}: PlayPauseButtonProps) => {
  const { isEnabled: isNewPodcastControlsEnabled } = useFlag(
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED,
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK
  )
  const currentUserId = useSelector(getUserId)
  const trackPlaybackInfo = useSelector((state: CommonState) =>
    getTrackPosition(state, { trackId, userId: currentUserId })
  )
  const isCurrentTrack = useSelector(
    (state: CommonState) => trackId === getTrackId(state)
  )

  let playText
  let PlayIconComponent
  if (isPreview) {
    playText = messages.preview
    PlayIconComponent = IconPlay
  } else {
    playText =
      isNewPodcastControlsEnabled && trackPlaybackInfo
        ? trackPlaybackInfo.status === 'IN_PROGRESS' || isCurrentTrack
          ? messages.resume
          : messages.replay
        : messages.play
    PlayIconComponent =
      isNewPodcastControlsEnabled &&
      trackPlaybackInfo?.status === 'COMPLETED' &&
      !isCurrentTrack
        ? IconRepeat
        : IconPlay
  }

  return (
    <Button
      name={isPreview ? 'preview' : 'play'}
      size={ButtonSize.LARGE}
      type={isPreview ? ButtonType.SECONDARY : ButtonType.PRIMARY_ALT}
      text={playing ? messages.pause : playText}
      leftIcon={playing ? <IconPause /> : <PlayIconComponent />}
      onClick={onPlay}
      minWidth={180}
      disabled={!doesUserHaveAccess && !isPreview}
    />
  )
}
