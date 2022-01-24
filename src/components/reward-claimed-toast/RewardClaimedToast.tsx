import React, { useContext, useEffect, useRef } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconCaretRight } from 'assets/img/iconCaretRight.svg'
import { getShowRewardClaimedToast } from 'common/store/pages/audio-rewards/selectors'
import { hideRewardClaimedToast } from 'common/store/pages/audio-rewards/slice'
import { ToastContext } from 'components/toast/ToastContext'
import ToastLinkContent from 'components/toast/mobile/ToastLinkContent'
import { getLocationPathname } from 'store/routing/selectors'
import { CLAIM_REWARD_TOAST_TIMEOUT_MILLIS } from 'utils/constants'
import { AUDIO_PAGE } from 'utils/route'

import styles from './RewardClaimedToast.module.css'

const messages = {
  challengeCompleted: 'You’ve Completed an $AUDIO Rewards Challenge!',
  seeMore: 'See more'
}

export const RewardClaimedToast = () => {
  const { toast } = useContext(ToastContext)
  const dispatch = useDispatch()
  const showToast = useSelector(getShowRewardClaimedToast)
  const pathname = useSelector(getLocationPathname)
  const isShowing = useRef(false)

  useEffect(() => {
    if (showToast && !isShowing.current) {
      const toastContent = (
        <div className={styles.rewardClaimedToast}>
          <span className={styles.rewardClaimedToastIcon}>
            <i className='emoji face-with-party-horn-and-party-hat' />
          </span>
          {pathname === AUDIO_PAGE ? (
            messages.challengeCompleted
          ) : (
            <ToastLinkContent
              text={messages.challengeCompleted}
              linkText={messages.seeMore}
              link={AUDIO_PAGE}
              linkIcon={<IconCaretRight className={styles.seeMoreCaret} />}
            />
          )}
        </div>
      )

      toast(toastContent, CLAIM_REWARD_TOAST_TIMEOUT_MILLIS)
      isShowing.current = true
      setTimeout(() => {
        dispatch(hideRewardClaimedToast())
        isShowing.current = false
      }, CLAIM_REWARD_TOAST_TIMEOUT_MILLIS)
    }
  }, [toast, dispatch, showToast, pathname, isShowing])

  return null
}
