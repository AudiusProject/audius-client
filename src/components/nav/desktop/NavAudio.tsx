import React, { cloneElement, useCallback } from 'react'

import BN from 'bn.js'
import cn from 'classnames'

import { ReactComponent as IconCaretRight } from 'assets/img/iconCaretRight.svg'
import IconNoTierBadge from 'assets/img/tokenBadgeNoTier.png'
import { FeatureFlags } from 'common/services/remote-config/feature-flags'
import { getAccountUser } from 'common/store/account/selectors'
import { getAccountTotalBalance } from 'common/store/wallet/selectors'
import { formatWei } from 'common/utils/wallet'
import { audioTierMapPng } from 'components/user-badges/UserBadges'
import { useSelectTierInfo } from 'components/user-badges/hooks'
import { useNavigateToPage } from 'hooks/useNavigateToPage'
import { useFlag } from 'hooks/useRemoteConfig'
import { useSelector } from 'utils/reducer'
import { AUDIO_PAGE } from 'utils/route'

import styles from './NavAudio.module.css'

const messages = {
  earnAudio: 'EARN $AUDIO',
  claimRewards: 'Claim Rewards'
}

const NavAudio = () => {
  // TODO: remove this feature flag ASAP as rewards launches because we could show $AUDIO far earlier
  // but need to wait for remote config
  const { isEnabled } = useFlag(FeatureFlags.SURFACE_AUDIO_ENABLED)

  const navigate = useNavigateToPage()
  const account = useSelector(getAccountUser)
  const totalBalance = useSelector(getAccountTotalBalance)
  const nonNullTotalBalance = totalBalance !== null
  const positiveTotalBalance =
    nonNullTotalBalance && totalBalance!.gt(new BN(0))
  // we only show the audio balance and respective badge when there is an account
  // so below null-coalescing is okay
  const { tier } = useSelectTierInfo(account?.user_id ?? 0)
  const audioBadge = audioTierMapPng[tier]
  const unclaimedRewards = false

  const goToAudioPage = useCallback(() => {
    navigate(AUDIO_PAGE)
  }, [navigate])

  if (!isEnabled || !account) {
    return null
  }

  return nonNullTotalBalance ? (
    <div
      className={cn(
        styles.audio,
        { [styles.hasBalance]: positiveTotalBalance },
        { [styles.show]: true }
      )}
      onClick={goToAudioPage}
    >
      {positiveTotalBalance && audioBadge ? (
        cloneElement(audioBadge, {
          height: 16,
          width: 16
        })
      ) : (
        <img alt='no tier' src={IconNoTierBadge} width='16' height='16' />
      )}
      <span className={styles.audioAmount}>
        {formatWei(totalBalance!, true, 0)}
      </span>
      {!positiveTotalBalance && !unclaimedRewards && (
        <span className={styles.actionBubble}>
          <span>{messages.earnAudio}</span>
          <IconCaretRight className={styles.actionCaret} />
        </span>
      )}
      {unclaimedRewards && (
        <span className={cn(styles.actionBubble, styles.claimRewards)}>
          <span>{messages.claimRewards}</span>
          <IconCaretRight className={styles.actionCaret} />
        </span>
      )}
    </div>
  ) : (
    <div className={styles.audio} />
  )
}

export default NavAudio
