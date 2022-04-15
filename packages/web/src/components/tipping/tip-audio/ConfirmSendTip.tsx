import React, { useCallback, useEffect, useState } from 'react'

import { Button, ButtonType, IconCheck, IconArrow } from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconCaretLeft } from 'assets/img/iconCaretLeft.svg'
import { SquareSizes } from 'common/models/ImageSizes'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSendAmount, getSendStatus } from 'common/store/tipping/selectors'
import { setSendStatus } from 'common/store/tipping/slice'
import { formatWei } from 'common/utils/wallet'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './TipAudio.module.css'

const messages = {
  sending: 'SENDING',
  areYouSure: 'Are you sure? This cannot be reversed.',
  confirmTip: 'Confirm Tip',
  goBack: 'Go Back'
}

export const ConfirmSendTip = () => {
  const dispatch = useDispatch()
  const sendStatus = useSelector(getSendStatus)
  const sendAmount = useSelector(getSendAmount)
  const profile = useSelector(getProfileUser)
  const profileImage = useUserProfilePicture(
    profile?.user_id ?? null,
    profile?._profile_picture_sizes ?? null,
    SquareSizes.SIZE_150_BY_150
  )
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    setIsDisabled(sendStatus !== 'CONFIRM' && sendStatus !== 'ERROR')
  }, [sendStatus])

  const handleConfirmSendClick = useCallback(() => {
    // todo: call send/transfer function
    dispatch(setSendStatus({ status: 'SENDING' }))
    // dispatch(setSendStatus({ status: 'SUCCESS' }))
  }, [dispatch])

  const handleGoBackClick = useCallback(() => {
    if (!isDisabled) {
      dispatch(setSendStatus({ status: 'SEND' }))
    }
  }, [isDisabled, dispatch])

  return profile ? (
    <div className={styles.container}>
      <div className={cn(styles.rowCenter, styles.sendingContainer)}>
        {messages.sending}
        <span className={styles.sendingIcon}>
          <IconArrow />
        </span>
      </div>
      <div className={cn(styles.rowCenter, styles.sendingAudio)}>
        <span className={styles.sendingAudioAmount}>
          {formatWei(sendAmount, true)}
        </span>
        $AUDIO
      </div>
      <div className={styles.profileUser}>
        <div className={styles.accountWrapper}>
          <img className={styles.dynamicPhoto} src={profileImage} />
          <div className={styles.userInfoWrapper}>
            <div className={styles.name}>
              {profile.name}
              <UserBadges
                userId={profile?.user_id}
                badgeSize={12}
                className={styles.badge}
              />
            </div>
            <div className={styles.handleContainer}>
              <span className={styles.handle}>{`@${profile.handle}`}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={cn(styles.rowCenter, styles.areYouSure)}>
        {messages.areYouSure}
      </div>
      <div className={cn(styles.rowCenter, styles.buttonContainer)}>
        <Button
          type={ButtonType.PRIMARY}
          text={messages.confirmTip}
          onClick={handleConfirmSendClick}
          rightIcon={
            sendStatus === 'SENDING' ? (
              <LoadingSpinner className={styles.loadingSpinner} />
            ) : (
              <IconCheck />
            )
          }
          disabled={isDisabled}
          className={cn({ [styles.disabled]: isDisabled })}
        />
      </div>
      <div
        className={cn(styles.rowCenter, styles.goBackContainer, {
          [styles.disabled]: isDisabled
        })}
        onClick={handleGoBackClick}
      >
        <IconCaretLeft />
        <span className={styles.goBack}>{messages.goBack}</span>
      </div>
    </div>
  ) : null
}
