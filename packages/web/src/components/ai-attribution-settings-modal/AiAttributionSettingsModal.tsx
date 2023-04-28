import { useCallback, useState } from 'react'

import { settingsPageActions, settingsPageSelectors } from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  Switch,
  IconRobot
} from '@audius/stems'
import { useDispatch } from 'react-redux'
import { useToggle } from 'react-use'

import { useModalState } from 'common/hooks/useModalState'
import { useSelector } from 'utils/reducer'

import styles from './AiAttributionSettingsModal.module.css'
const { setAiAttribution } = settingsPageActions
const { getAllowAiAttribution } = settingsPageSelectors

const messages = {
  title: 'AI Generated Music Settings',
  label: 'Allow AI-generated music based on my likeness',
  description1:
    'By opting in, you grant permission for AI models to be trained using your musical likeness, opening up a world of possibilities for you and your fans.',
  description2:
    ' With this feature enabled, a special section will appear on your profile, showcasing any AI-generated tracks that emulate your sound.',

  done: 'Done'
}

export const AiAttributionSettingsModal = () => {
  const [isOpen, setIsOpen] = useModalState('AiAttributionSettings')
  const allowAiAttribution = useSelector(getAllowAiAttribution)
  const [isAiAttributionEnabled, toggleAiAttribution] = useToggle(
    !!allowAiAttribution
  )
  const dispatch = useDispatch()

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleSubmit = useCallback(() => {
    dispatch(setAiAttribution(isAiAttributionEnabled))
    handleClose()
  }, [dispatch, isAiAttributionEnabled, handleClose])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      bodyClassName={styles.root}
      dismissOnClickOutside={false}
    >
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
          <Switch
            checked={isAiAttributionEnabled}
            onChange={toggleAiAttribution}
          />
        </label>
        <span className={styles.description}>{messages.description1}</span>
        <span className={styles.description}>{messages.description2}</span>
        <Button
          text={messages.done}
          type={ButtonType.PRIMARY}
          size={ButtonSize.MEDIUM}
          className={styles.doneButton}
          onClick={handleSubmit}
        />
      </ModalContent>
    </Modal>
  )
}
