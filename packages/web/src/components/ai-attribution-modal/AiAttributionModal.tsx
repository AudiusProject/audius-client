import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalProps,
  ModalTitle,
  Switch
} from '@audius/stems'
import { useToggle } from 'react-use'

import { ReactComponent as IconRobot } from 'assets/img/robot.svg'

import { AiAttributionDropdown } from './AiAttributionDropdown'
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
  const [isAttributable, toggleIsAttributable] = useToggle(false)
  return (
    <Modal isOpen={isOpen} onClose={onClose} bodyClassName={styles.root}>
      <ModalHeader>
        <ModalTitle
          title={messages.title}
          titleClassName={styles.title}
          icon={<IconRobot className={styles.titleIcon} />}
        />
      </ModalHeader>
      <ModalContent className={styles.content} forward>
        <label className={styles.switchLabel}>
          <span className={styles.switchLabelText}>{messages.label}</span>
          <Switch checked={isAttributable} onChange={toggleIsAttributable} />
        </label>
        <span className={styles.description}>{messages.description}</span>
        {isAttributable ? <AiAttributionDropdown /> : null}
      </ModalContent>
    </Modal>
  )
}
