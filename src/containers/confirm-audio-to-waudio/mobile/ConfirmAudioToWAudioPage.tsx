import React, { useCallback, useState } from 'react'

import { Button, ButtonType } from '@audius/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import MobilePageContainer from 'components/general/MobilePageContainer'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { confirmTransferAudioToWAudio } from 'store/audio-manager/slice'

import styles from './ConfirmAudioToWAudioPage.module.css'

const messages = {
  title: 'Hang Tight ',
  header: 'Audius is now much faster!',
  description:
    'Before you can start listening we’ll have to upgrade your $AUDIO.',
  moreInfo: 'More Info',
  confirm: 'Let’s Do It!',
  loadingTitle: '✋ Hold on, this will just take a moment.',
  loadingBody:
    'We’re now making some changes behind the scenes to keep the music going.'
}

/**
 * Modal body for loading text while waiting to confirm
 */
const LoadingBody = () => {
  return (
    <div className={styles.body}>
      <div className={cn(styles.bodyText, styles.loadingTitle)}>
        {messages.loadingTitle}
      </div>
      <div className={cn(styles.bodyText, styles.loadingBody)}>
        {messages.loadingBody}
      </div>
      <LoadingSpinner className={styles.loadingSpinner} />
    </div>
  )
}

/**
 * Modal body w/ cta for user to confirm converting $AUDIO to $WAUDIO
 */
const CTABody = ({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <div className={styles.body}>
      <div className={styles.header}>{messages.header}</div>
      <div className={styles.bodyText}>{messages.description}</div>
      <a className={styles.moreInfo}>{messages.moreInfo}</a>
      <Button
        type={ButtonType.PRIMARY_ALT}
        className={styles.btn}
        textClassName={styles.btnText}
        onClick={onConfirm}
        text={messages.confirm}
      />
    </div>
  )
}

const ConfirmAudioToWAudioPage = () => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)

  const onConfirm = useCallback(() => {
    setIsLoading(true)
    dispatch(confirmTransferAudioToWAudio())
  }, [setIsLoading, dispatch])

  const body = isLoading ? <LoadingBody /> : <CTABody onConfirm={onConfirm} />

  return <MobilePageContainer>{body}</MobilePageContainer>
}

export default ConfirmAudioToWAudioPage
