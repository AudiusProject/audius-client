import { FeatureFlags, ID, premiumContentSelectors } from '@audius/common'
import { Button, ButtonType, IconPause, IconPlay } from '@audius/stems'
import { useFlag } from 'hooks/useRemoteConfig'
import { useSelector } from 'react-redux'
import styles from './GiantTrackTile.module.css'

type PlayPauseButtonProps = {
  trackId: ID
  isPremium: boolean
  playing: boolean
  onPlay: () => void
}

const { getPremiumTrackSignatureMap } = premiumContentSelectors

export const PlayPauseButton = ({ trackId, isPremium, playing, onPlay }: PlayPauseButtonProps) => {
  const { isEnabled: isPremiumContentEnabled } = useFlag(
    FeatureFlags.PREMIUM_CONTENT_ENABLED
  )
  const premiumTrackSignatureMap = useSelector(getPremiumTrackSignatureMap)

  return (
    <Button
      name='play'
      className={styles.playButton}
      textClassName={styles.playButtonText}
      type={ButtonType.PRIMARY_ALT}
      text={playing ? 'PAUSE' : 'PLAY'}
      leftIcon={playing ? <IconPause /> : <IconPlay />}
      onClick={onPlay}
      disabled={isPremiumContentEnabled && isPremium ? !premiumTrackSignatureMap[trackId] : false}
    />
  )
}
