import React, { useCallback, useState } from 'react'

import { Button, ButtonType, Modal } from '@audius/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import Drawer from 'components/drawer/Drawer'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { getModalVisibility } from 'store/application/ui/modals/slice'
import { confirmTransferAudioToWAudio } from 'store/audio-manager/slice'
import { isMobile as checkIsMobile } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'

import styles from './ConfirmAudioToWAudioModal.module.css'

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

type AudioToWAudioMobileDrawerProps = {
  isOpen: boolean
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

const AudioToWAudioMobileDrawer = ({
  isOpen,
  isLoading,
  onConfirm,
  onClose
}: AudioToWAudioMobileDrawerProps) => {
  const body = isLoading ? <LoadingBody /> : <CTABody onConfirm={onConfirm} />
  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {body}
    </Drawer>
  )
}

const ConfirmAudioToWAudioModal = () => {
  const isMobile = checkIsMobile()

  const dispatch = useDispatch()

  const isOpen = useSelector(state =>
    getModalVisibility(state, 'ConfirmAudioToWAudio')
  )
  const [isLoading, setIsLoading] = useState(false)

  const onConfirm = useCallback(() => {
    setIsLoading(true)
    dispatch(confirmTransferAudioToWAudio())
  }, [setIsLoading, dispatch])

  const onClose = useCallback(() => {}, [])

  if (isMobile) {
    return (
      <AudioToWAudioMobileDrawer
        onClose={onClose}
        isOpen={isOpen}
        onConfirm={onConfirm}
        isLoading={isLoading}
      />
    )
  }
  const body = isLoading ? <LoadingBody /> : <CTABody onConfirm={onConfirm} />

  return (
    <Modal
      isOpen={isOpen}
      showTitleHeader
      titleClassName={styles.modalTitle}
      bodyClassName={styles.modalBody}
      onClose={onClose}
      title={
        <>
          {messages.title}{' '}
          <i className={cn('emoji', 'woman-surfing', styles.titleEmoji)} />
        </>
      }
      allowScroll={false}
      dismissOnClickOutside={false}
      showDismissButton={false}
    >
      {body}
    </Modal>
  )
}

export default ConfirmAudioToWAudioModal
