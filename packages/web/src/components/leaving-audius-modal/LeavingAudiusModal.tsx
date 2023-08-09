import { useCallback } from 'react'

import { useLeavingAudiusModal } from '@audius/common'
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

import { Icon } from 'components/Icon'
import { Text } from 'components/typography'

import { HelpCallout } from '../help-callout/HelpCallout'

import styles from './LeavingAudiusModal.module.css'

const messages = {
  title: 'Are You Sure?',
  body: 'This link is taking you to the following website',
  goBack: 'Go Back',
  visitSite: 'Visit Site'
}

export const LeavingAudiusModal = () => {
  const { isOpen, data, onClose, onClosed } = useLeavingAudiusModal()
  const { link } = data
  const handleOpen = useCallback(() => {
    window.open(link, '_blank', 'noreferrer,noopener')
  }, [link])
  return (
    <Modal
      bodyClassName={styles.modalBody}
      isOpen={isOpen}
      onClose={onClose}
      onClosed={onClosed}
    >
      <ModalHeader>
        <ModalTitle
          iconClassName={styles.icon}
          icon={<Icon icon={IconInfo} />}
          title={messages.title}
        />
      </ModalHeader>
      <ModalContent className={styles.content}>
        <Text>{messages.body}</Text>
        <HelpCallout
          contentClassName={styles.hintContent}
          icon={<IconExternalLink />}
          content={link}
        />
      </ModalContent>
      <ModalFooter className={styles.footer}>
        <HarmonyButton
          className={styles.button}
          variant={HarmonyButtonType.GHOST}
          text={messages.goBack}
          onClick={onClose}
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
