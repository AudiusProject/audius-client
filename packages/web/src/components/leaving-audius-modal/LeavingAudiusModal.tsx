import { useCallback } from 'react'

import {
  HarmonyButton,
  HarmonyButtonType,
  IconExternalLink,
  IconInfo,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle
} from '@audius/stems'

import { useModalState } from 'common/hooks/useModalState'

import { HelpCallout } from '../help-callout/HelpCallout'

import styles from './LeavingAudiusModal.module.css'

const messages = {
  title: 'Are You Sure?',
  body: 'This link is taking you to the following website',
  goBack: 'Go Back',
  visitSite: 'Visit Site'
}

export const LeavingAudiusModal = () => {
  const [isOpen, setIsOpen] = useModalState('LeavingAudius')
  const link =
    'https://blog.audius.co/article/easy-goin-and-free-flowin-hot-new-7-24-23'
  const handleOpen = useCallback(() => {
    window.open(link, '_blank', 'noreferrer,noopener')
  }, [])
  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])
  return (
    <Modal
      bodyClassName={styles.modalBody}
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalHeader>
        <ModalTitle
          iconClassName={styles.icon}
          icon={<IconInfo />}
          title={messages.title}
        />
      </ModalHeader>
      <ModalContent className={styles.content}>
        <p className={styles.text}>{messages.body}</p>
        <HelpCallout icon={<IconExternalLink />} content={link} />
      </ModalContent>
      <ModalFooter className={styles.footer}>
        <HarmonyButton
          className={styles.button}
          variant={HarmonyButtonType.GHOST}
          text={messages.goBack}
          onClick={handleClose}
        />
        <HarmonyButton
          className={styles.button}
          text={messages.visitSite}
          onClick={handleOpen}
        />
      </ModalFooter>
    </Modal>
  )
}
