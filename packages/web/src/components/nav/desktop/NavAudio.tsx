import React, { cloneElement, useCallback, useEffect, useState } from 'react'

import BN from 'bn.js'
import cn from 'classnames'
import { animated, Transition } from 'react-spring/renderprops'

import { ReactComponent as IconCaretRight } from 'assets/img/iconCaretRight.svg'
import IconNoTierBadge from 'assets/img/tokenBadgeNoTier.png'
import { BNWei } from 'common/models/Wallet'
import { getAccountUser } from 'common/store/account/selectors'
import { getOptimisticUserChallenges } from 'common/store/challenges/selectors/optimistic-challenges'
import { getAccountTotalBalance } from 'common/store/wallet/selectors'
import { formatWei } from 'common/utils/wallet'
import { audioTierMapPng } from 'components/user-badges/UserBadges'
import { useSelectTierInfo } from 'components/user-badges/hooks'
import { useNavigateToPage } from 'hooks/useNavigateToPage'
import { useSelector } from 'utils/reducer'
import { AUDIO_PAGE } from 'utils/route'

import styles from './NavAudio.module.css'

type BubbleType = 'none' | 'claim' | 'earn'

const messages = {
  earnAudio: 'EARN $AUDIO',
  claimRewards: 'Claim Rewards'
}

const NavAudio = () => {
  const navigate = useNavigateToPage()
  const account = useSelector(getAccountUser)
  let totalBalance = useSelector(getAccountTotalBalance)
  if (totalBalance === null && account?.total_balance) {
    totalBalance = new BN(account?.total_balance) as BNWei
  }
  const nonNullTotalBalance = totalBalance !== null

  const positiveTotalBalance =
    nonNullTotalBalance && totalBalance!.gt(new BN(0))
  // we only show the audio balance and respective badge when there is an account
  // so below null-coalescing is okay
  const { tier } = useSelectTierInfo(account?.user_id ?? 0)
  const audioBadge = audioTierMapPng[tier]

  const userChallenges = useSelector(getOptimisticUserChallenges)
  const hasClaimableTokens = Object.values(userChallenges).some(
    challenge => challenge && challenge.claimableAmount > 0
  )

  const [bubbleType, setBubbleType] = useState<BubbleType>('none')

  const goToAudioPage = useCallback(() => {
    navigate(AUDIO_PAGE)
  }, [navigate])

  useEffect(() => {
    if (hasClaimableTokens) {
      setBubbleType('claim')
    } else if (nonNullTotalBalance && !positiveTotalBalance) {
      setBubbleType('earn')
    } else {
      setBubbleType('none')
    }
  }, [
    setBubbleType,
    hasClaimableTokens,
    nonNullTotalBalance,
    positiveTotalBalance
  ])

  if (!account) {
    return null
  }
  if (!nonNullTotalBalance) {
    return <div className={styles.audio} />
  }

  return (
    <div
      className={cn(
        styles.audio,
        { [styles.hasBalance]: positiveTotalBalance },
        { [styles.show]: true }
      )}
      onClick={goToAudioPage}
    >
      <div className={styles.amountContainer}>
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
      </div>
      <div className={styles.bubbleContainer}>
        <Transition
          items={bubbleType}
          from={{ opacity: 0 }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0 }}
          config={{ duration: 100 }}
        >
          {item => props =>
            item !== 'none' && (
              <animated.span
                style={props}
                className={cn(styles.actionBubble, {
                  [styles.claimRewards]: item === 'claim'
                })}
              >
                <span>
                  {item === 'claim'
                    ? messages.claimRewards
                    : messages.earnAudio}
                </span>
                <IconCaretRight className={styles.actionCaret} />
              </animated.span>
            )}
        </Transition>
      </div>
    </div>
  )
}

export default NavAudio
