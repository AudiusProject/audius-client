import React, { cloneElement } from 'react'

import BN from 'bn.js'

import { ReactComponent as IconCaretRight } from 'assets/img/iconCaretRight.svg'
import IconNoTierBadge from 'assets/img/tokenBadgeNoTier.png'
import { getAccountUser } from 'common/store/account/selectors'
import { audioTierMapPng } from 'containers/user-badges/UserBadges'
import { useSelectTierInfo } from 'containers/user-badges/hooks'
import { getAccountTotalBalance } from 'store/wallet/selectors'
import { useSelector } from 'utils/reducer'
import { formatWei } from 'utils/wallet'

import styles from './NavAudio.module.css'

const messages = {
  earnAudio: 'EARN $AUDIO'
}

const NavAudio = () => {
  const account = useSelector(getAccountUser)
  const totalBalance = useSelector(getAccountTotalBalance) ?? null
  const nonNullTotalBalance = totalBalance !== null
  const positiveTotalBalance =
    nonNullTotalBalance && totalBalance!.gt(new BN(0))
  // we only show the audio balance and respective badge when there is an account
  // so below null-coalescing is okay
  const { tier } = useSelectTierInfo(account?.user_id ?? 0)
  const audioBadge = audioTierMapPng[tier]
  console.log({ totalBalance, tier })

  return positiveTotalBalance ? (
    <div className={styles.audio}>
      {audioBadge &&
        cloneElement(audioBadge, {
          height: 16,
          width: 16
        })}
      <span className={styles.audioAmount}>
        {formatWei(totalBalance!, true, 0)}
      </span>
    </div>
  ) : nonNullTotalBalance ? (
    <div className={styles.audio}>
      <img alt='no tier' src={IconNoTierBadge} width='16' height='16' />
      <span className={styles.audioAmount}>
        {formatWei(totalBalance!, true, 0)}
      </span>
      <span className={styles.earnAudio}>
        <span>{messages.earnAudio}</span>
        <IconCaretRight className={styles.earnAudioCaret} />
      </span>
    </div>
  ) : (
    <div className={styles.audio} />
  )
}

export default NavAudio
