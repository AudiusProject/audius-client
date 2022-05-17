import React, { useCallback, useEffect, useState } from 'react'

import { Button, ButtonType, IconCheck } from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconCaretLeft } from 'assets/img/iconCaretLeft.svg'
import { ReactComponent as IconSend } from 'assets/img/iconSend.svg'
import { SquareSizes } from 'common/models/ImageSizes'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSendAmount, getSendStatus } from 'common/store/tipping/selectors'
import { confirmSendTip, beginTip } from 'common/store/tipping/slice'
import { formatWei } from 'common/utils/wallet'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './TipAudio.module.css'

const messages = {
  sending: 'SENDING',
  areYouSure: 'Are you sure? This cannot be reversed.',
  confirmTip: 'Confirm Tip',
  goBack: 'Go Back',
  somethingWrong: 'Something’s gone wrong. Wait a little while and try again.',
  maintenance: 'We’re performing some necessary one-time maintenence.',
  fewMinutes: 'This may take a few minutes.',
  holdOn: 'Don’t close this window or refresh the page.'
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
    dispatch(confirmSendTip())
  }, [dispatch])

  const handleGoBackClick = useCallback(() => {
    if (!isDisabled) {
      dispatch(beginTip({ user: profile }))
    }
  }, [isDisabled, dispatch, profile])

  const renderSendingAudio = () => (
    <>
      <div className={cn(styles.flexCenter, styles.sendingContainer)}>
        <span className={styles.sendingIcon}>
          <IconSend />
        </span>
        {messages.sending}
      </div>
      <div className={cn(styles.flexCenter, styles.sendingAudio)}>
        <span className={styles.sendAmount}>{formatWei(sendAmount, true)}</span>
        $AUDIO
      </div>
    </>
  )

  const renderProfilePicture = () =>
    profile ? (
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
    ) : null

  const renderConfirmInfo = () =>
    sendStatus === 'CONFIRM' ? (
      <div className={cn(styles.flexCenter, styles.info)}>
        {messages.areYouSure}
      </div>
    ) : null

  const renderConvertingInfo = () =>
    sendStatus === 'CONVERTING' ? (
      <div>
        <div className={cn(styles.flexCenter, styles.info)}>
          {messages.maintenance}
        </div>
        <div className={cn(styles.flexCenter, styles.textCenter, styles.info)}>
          {messages.fewMinutes}
          <br />
          {messages.holdOn}
        </div>
      </div>
    ) : null

  const renderError = () =>
    sendStatus === 'ERROR' ? (
      <div className={cn(styles.flexCenter, styles.error)}>
        {messages.somethingWrong}
      </div>
    ) : null

  return profile ? (
    <div className={styles.container}>
      {renderSendingAudio()}
      {renderProfilePicture()}
      {renderConfirmInfo()}
      {renderConvertingInfo()}
      {renderError()}
      <div className={cn(styles.flexCenter, styles.buttonContainer)}>
        <Button
          type={ButtonType.PRIMARY}
          text={messages.confirmTip}
          onClick={handleConfirmSendClick}
          rightIcon={
            sendStatus === 'SENDING' || sendStatus === 'CONVERTING' ? (
              <LoadingSpinner className={styles.loadingSpinner} />
            ) : (
              <IconCheck />
            )
          }
          disabled={isDisabled}
          className={cn(styles.button, { [styles.disabled]: isDisabled })}
        />
      </div>
      {sendStatus !== 'SENDING' && sendStatus !== 'CONVERTING' && (
        <div
          className={cn(styles.flexCenter, styles.goBackContainer, {
            [styles.disabled]: isDisabled
          })}
          onClick={handleGoBackClick}
        >
          <IconCaretLeft />
          <span className={styles.goBack}>{messages.goBack}</span>
        </div>
      )}
    </div>
  ) : null
}
