import { cloneElement, useCallback } from 'react'

import {
  BadgeTier,
  StringKeys,
  formatWei,
  accountSelectors,
  audioRewardsPageSelectors,
  walletSelectors,
  useSelectTierInfo,
  useAccountHasClaimableRewards
} from '@audius/common'
import BN from 'bn.js'
import cn from 'classnames'
import { animated, Transition } from 'react-spring/renderprops'

import { ReactComponent as IconCaretRight } from 'assets/img/iconCaretRight.svg'
import IconNoTierBadge from 'assets/img/tokenBadgeNoTier.png'
import { audioTierMapPng } from 'components/user-badges/UserBadges'
import { useNavigateToPage } from 'hooks/useNavigateToPage'
import { useRemoteVar } from 'hooks/useRemoteConfig'
import { useSelector } from 'utils/reducer'
import { AUDIO_PAGE } from 'utils/route'

import styles from './NavAudio.module.css'
const { getAccountTotalBalance, getAccountBalanceLoading } = walletSelectors
const getAccountUser = accountSelectors.getAccountUser
const { getUserChallengesLoading } = audioRewardsPageSelectors

type BubbleType = 'none' | 'claim' | 'earn'

const messages = {
  earnAudio: 'EARN $AUDIO',
  claimRewards: 'Claim Rewards'
}

type RewardsActionBubbleProps = {
  bubbleType: BubbleType
  onClick(): void
  style?: React.CSSProperties
}

const RewardsActionBubble = ({
  bubbleType,
  onClick,
  style
}: RewardsActionBubbleProps) => {
  if (bubbleType === 'none') {
    return null
  }
  return (
    <animated.span
      style={style}
      className={cn(styles.actionBubble, styles.interactive, {
        [styles.claimRewards]: bubbleType === 'claim'
      })}
      onClick={onClick}
    >
      <span>
        {bubbleType === 'claim' ? messages.claimRewards : messages.earnAudio}
      </span>
      <IconCaretRight className={styles.actionCaret} />
    </animated.span>
  )
}

const RenderNavAudio = () => {
  const navigate = useNavigateToPage()
  const account = useSelector(getAccountUser)

  const totalBalance = useSelector(getAccountTotalBalance)
  const positiveTotalBalance = totalBalance.gt(new BN(0))
  // we only show the audio balance and respective badge when there is an account
  // so below null-coalescing is okay
  const { tier } = useSelectTierInfo(account?.user_id ?? 0)
  const audioBadge = audioTierMapPng[tier as BadgeTier]

  const challengeRewardIds = useRemoteVar(StringKeys.CHALLENGE_REWARD_IDS)
  const hasClaimableRewards = useAccountHasClaimableRewards(challengeRewardIds)

  const goToAudioPage = useCallback(() => {
    navigate(AUDIO_PAGE)
  }, [navigate])

  let bubbleType: BubbleType = 'none'
  if (hasClaimableRewards) {
    bubbleType = 'claim'
  } else if (!positiveTotalBalance) {
    bubbleType = 'earn'
  }

  return (
    <div className={styles.audio}>
      <div
        className={cn(styles.amountContainer, styles.interactive, {
          [styles.hasBalance]: positiveTotalBalance
        })}
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
      </div>
      <div className={styles.bubbleContainer}>
        <Transition
          items={bubbleType}
          from={{ opacity: 0 }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0 }}
          config={{ duration: 100 }}
        >
          {(bubbleType) => (style) =>
            (
              <RewardsActionBubble
                bubbleType={bubbleType}
                style={style}
                onClick={goToAudioPage}
              />
            )}
        </Transition>
      </div>
    </div>
  )
}

const NavAudio = () => {
  const userChallengesLoading = useSelector(getUserChallengesLoading)
  const balanceLoading = useSelector(getAccountBalanceLoading)
  const account = useSelector(getAccountUser)

  // Wait for all the states we care about to load to prevent flashing
  // of conditional content
  if (balanceLoading || userChallengesLoading || !account) {
    return null
  }

  return <RenderNavAudio />
}

export default NavAudio
