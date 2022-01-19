import React, { useContext, useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconCaretRight } from 'assets/img/iconCaretRight.svg'
import { getShowToast } from 'common/store/pages/audio-rewards/selectors'
import { hideRewardsToast } from 'common/store/pages/audio-rewards/slice'
import { ToastContext } from 'components/toast/ToastContext'
import ToastLinkContent from 'components/toast/mobile/ToastLinkContent'
import { getLocationPathname } from 'store/routing/selectors'
import { CLAIM_REWARD_TOAST_TIMEOUT_MILLIS } from 'utils/constants'
import { AUDIO_PAGE } from 'utils/route'

import styles from '../App.module.css'

const messages = {
  challengeCompleted: 'You’ve Completed an $AUDIO Rewards Challenge!',
  seeMore: 'See more'
}

export const RewardClaimedToast = () => {
  const { toast } = useContext(ToastContext)
  const dispatch = useDispatch()
  const showToast = useSelector(getShowToast)
  const pathname = useSelector(getLocationPathname)

  useEffect(() => {
    if (showToast) {
      const toastContent =
        pathname === AUDIO_PAGE ? (
          <div className={styles.rewardClaimedToast}>
            <span className={styles.rewardClaimedToastIcon}>
              <i className='emoji face-with-party-horn-and-party-hat' />
            </span>
            &nbsp;&nbsp;
            {messages.challengeCompleted}
          </div>
        ) : (
          <div className={styles.rewardClaimedToast}>
            <span className={styles.rewardClaimedToastIcon}>
              <i className='emoji face-with-party-horn-and-party-hat' />
            </span>
            &nbsp;&nbsp;
            <ToastLinkContent
              text={messages.challengeCompleted}
              linkText={messages.seeMore}
              link={AUDIO_PAGE}
              linkIcon={<IconCaretRight className={styles.seeMoreCaret} />}
            />
          </div>
        )

      toast(toastContent, CLAIM_REWARD_TOAST_TIMEOUT_MILLIS)
      setTimeout(() => {
        dispatch(hideRewardsToast())
      }, CLAIM_REWARD_TOAST_TIMEOUT_MILLIS)
    }
  }, [toast, dispatch, showToast, pathname])

  return null
}
