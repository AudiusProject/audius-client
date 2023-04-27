import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalProps,
  ModalTitle
} from '@audius/stems'

import { ReactComponent as IconRobot } from 'assets/img/robot.svg'
import AiSearchBar from 'components/search-ai/ConnectedSearchBar'

import styles from './AiAttributionModal.module.css'

const messages = {
  title: 'AI Attribution',
  label: 'Mark this track as AI-generated',
  description:
    'If your AI-generated track was trained on an existing Audius artist, you can give them credit here. Only users who have opted-in will appear in this list.'
}

type AiAttributionModalProps = ModalProps

export const AiAttributionModal = (props: AiAttributionModalProps) => {
  const { isOpen, onClose } = props
  return (
    <Modal isOpen={isOpen} onClose={onClose} bodyClassName={styles.root}>
      <ModalHeader>
        <ModalTitle
          title={messages.title}
          icon={<IconRobot className={styles.icon} />}
        />
      </ModalHeader>
      <ModalContent>
        <div style={{ height: 1000, width: 300 }}>
          <AiSearchBar />
        </div>
      </ModalContent>
    </Modal>
  )
}
