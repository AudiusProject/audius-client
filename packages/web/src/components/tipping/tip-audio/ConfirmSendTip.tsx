import { useCallback, useEffect, useState } from 'react'

import { Button, ButtonType, IconCheck } from '@audius/stems'
import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Transition, animated } from 'react-spring/renderprops'

import { ReactComponent as IconCaretLeft } from 'assets/img/iconCaretLeft.svg'
import { ReactComponent as IconSend } from 'assets/img/iconSend.svg'
import { getSendTipData } from 'common/store/tipping/selectors'
import { confirmSendTip, beginTip } from 'common/store/tipping/slice'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import { ProfileInfo } from '../../profile-info/ProfileInfo'

import styles from './TipAudio.module.css'

const messages = {
  sending: 'SENDING',
  areYouSure: 'Are you sure? This cannot be reversed.',
  confirmTip: 'Confirm Tip',
  confirmAndTryAgain: 'Confirm & Try Again',
  goBack: 'Go Back',
  somethingWrong: 'Something’s gone wrong. Wait a little while and try again.',
  maintenance: 'We’re performing some necessary one-time maintenance.',
  fewMinutes: 'This may take a few minutes.',
  holdOn: 'Don’t close this window or refresh the page.'
}

const ErrorMessage = () => (
  <div className={cn(styles.flexCenter, styles.error)}>
    {messages.somethingWrong}
  </div>
)

const ConfirmInfo = () => (
  <div className={cn(styles.flexCenter, styles.info)}>
    {messages.areYouSure}
  </div>
)

const ConvertingInfo = ({ isVisible }: { isVisible: boolean }) => (
  <Transition
    items={isVisible}
    from={{ opacity: 0 }}
    enter={{ opacity: 1 }}
    leave={{}}
    unique
  >
    {(item) => (style) =>
      item ? (
        <animated.div style={style} className={styles.info}>
          <p>{messages.maintenance}</p>
          <br />
          <p>{messages.fewMinutes}</p>
          <p>{messages.holdOn}</p>
        </animated.div>
      ) : null}
  </Transition>
)

export const ConfirmSendTip = () => {
  const dispatch = useDispatch()
  const {
    user: receiver,
    status: sendStatus,
    amount: sendAmount,
    source
  } = useSelector(getSendTipData)
  const [isDisabled, setIsDisabled] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  useEffect(() => {
    setIsDisabled(isSending || isConverting)
  }, [isSending, isConverting])

  const handleConfirmSendClick = useCallback(() => {
    setHasError(false)
    dispatch(confirmSendTip())
  }, [dispatch])

  const handleGoBackClick = useCallback(() => {
    if (!isDisabled) {
      dispatch(beginTip({ user: receiver, source }))
    }
  }, [isDisabled, dispatch, receiver, source])

  // Make the states stick so that the transitions look nice
  useEffect(() => {
    if (sendStatus === 'ERROR') {
      setHasError(true)
      setIsSending(false)
      setIsConverting(false)
    } else if (sendStatus === 'SENDING') {
      setIsSending(true)
      setIsConverting(false)
      setHasError(false)
    } else if (sendStatus === 'CONVERTING') {
      setIsConverting(true)
      setIsSending(false)
      setHasError(false)
    }
  }, [sendStatus, setHasError, setIsSending, setIsConverting])

  const renderSendingAudio = () => (
    <div className={styles.modalContentHeader}>
      <div className={cn(styles.flexCenter, styles.modalContentHeaderTitle)}>
        <span className={styles.sendingIcon}>
          <IconSend />
        </span>
        {messages.sending}
      </div>
      <div className={cn(styles.flexCenter, styles.modalContentHeaderSubtitle)}>
        <span className={styles.sendAmount}>{sendAmount}</span>
        $AUDIO
      </div>
    </div>
  )

  return receiver ? (
    <div className={styles.container}>
      {renderSendingAudio()}
      <ProfileInfo user={receiver} />
      {/*
      Even though the isVisible prop is being passed in, we
      only render the converting message if is converting.
      This will make it so that when we are converting, the
      message will be animated/faded in, but when conversion
      is done (whether successful or failed), we hide the
      message without fading out. This is so that the UI
      does not show both the large conversion message and the
      error message at the same time.
      */}
      {isConverting ? <ConvertingInfo isVisible={isConverting} /> : null}
      {hasError ? <ErrorMessage /> : null}
      {!hasError && !isSending && !isConverting ? <ConfirmInfo /> : null}
      <div className={cn(styles.flexCenter, styles.buttonContainer)}>
        <Button
          type={ButtonType.PRIMARY}
          text={
            hasError
              ? messages.confirmAndTryAgain
              : !isSending && !isConverting
              ? messages.confirmTip
              : ''
          }
          onClick={handleConfirmSendClick}
          rightIcon={
            isSending || isConverting ? (
              <LoadingSpinner className={styles.loadingSpinner} />
            ) : (
              <IconCheck />
            )
          }
          disabled={isDisabled}
          className={cn(styles.button, styles.confirmButton, {
            [styles.disabled]: isDisabled
          })}
        />
      </div>
      {!isSending && !isConverting ? (
        <div
          className={cn(styles.flexCenter, styles.goBackContainer)}
          onClick={handleGoBackClick}
        >
          <IconCaretLeft />
          <span className={styles.goBack}>{messages.goBack}</span>
        </div>
      ) : null}
    </div>
  ) : null
}
