import React from 'react'

import { Button, Modal } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useModalState } from 'hooks/useModalState'

import styles from './ShareSoundToTikTokModal.module.css'

const messages = {
  title: 'Share to TikTok',
  confirmation: 'Are you sure you want to share "[Track Name]" to TikTok?',
  inProgress: 'Sharing "[Track Name]" to TikTok',
  success: '"[Track Name]" has been shared to TikTok!',
  shareButton: 'Share Sound to TikTok',
  errorMinLength: 'Minimum Length for TikTok Sounds is 10 Seconds',
  errorMaxLength: 'Maximum Length for TikTok Sounds is 5 Minutes',
  errorMaxFilesize: 'Maximum TikTok Filesize Exceeded',
  completeButton: 'Done'
}

const ShareSoundToTikTikModal = () => {
  const [isOpen, setIsOpen] = useModalState('ShareSoundToTikTok')
  const dispatch = useDispatch()

  return (
    <Modal
      isOpen={isOpen}
      showTitleHeader
      showDismissButton
      title={messages.title}
      onClose={() => setIsOpen(false)}
      allowScroll={false}
      bodyClassName={styles.modalBody}
      headerContainerClassName={styles.modalHeader}
    >
      <div className={styles.modalContent}>
        <div>{messages.confirmation}</div>
        <Button className={styles.button} text={messages.shareButton}></Button>
      </div>
    </Modal>
  )
}

export default ShareSoundToTikTikModal
