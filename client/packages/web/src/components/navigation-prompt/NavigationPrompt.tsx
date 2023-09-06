import React, { useEffect, useState } from 'react'

import {
  HarmonyButton,
  HarmonyButtonType,
  Modal,
  ModalContent,
  ModalHeader
} from '@audius/stems'
import cn from 'classnames'
import { Location } from 'history'
import { Prompt } from 'react-router-dom'

import layoutStyles from 'components/layout/layout.module.css'
import { Text } from 'components/typography'
import { useNavigateToPage } from 'hooks/useNavigateToPage'

import styles from './NavigationPrompt.module.css'

interface Props {
  when?: boolean | undefined
  shouldBlockNavigation?: (location: Location) => boolean
  messages: {
    title: string
    body: string
    cancel: string
    proceed: string
  }
}

/**
 * Adapted from https://gist.github.com/michchan/0b142324b2a924a108a689066ad17038#file-routeleavingguard-function-ts-ca839f5faf39-tsx
 */
export const NavigationPrompt = (props: Props) => {
  const { when, shouldBlockNavigation, messages } = props
  const [modalVisible, setModalVisible] = useState(false)
  const [lastLocation, setLastLocation] = useState<Location | null>(null)
  const [confirmedNavigation, setConfirmedNavigation] = useState(false)
  const navigate = useNavigateToPage()

  const closeModal = () => {
    setModalVisible(false)
  }

  // Returning false blocks navigation; true allows it
  const handleBlockedNavigation = (nextLocation: Location): boolean => {
    if (
      !confirmedNavigation &&
      (!shouldBlockNavigation || shouldBlockNavigation(nextLocation))
    ) {
      setModalVisible(true)
      setLastLocation(nextLocation)
      return false
    }
    return true
  }

  const handleConfirmNavigationClick = () => {
    setModalVisible(false)
    setConfirmedNavigation(true)
  }

  useEffect(() => {
    if (confirmedNavigation && lastLocation) {
      // Navigate to the previous blocked location with your navigate function
      navigate(lastLocation.pathname)
    }
  }, [confirmedNavigation, lastLocation, navigate])

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
      <Modal isOpen={modalVisible} onClose={closeModal} size='small'>
        <ModalHeader>
          <Text
            className={styles.title}
            size='xLarge'
            variant='label'
            strength='strong'
            color='neutralLight2'
          >
            {messages.title}
          </Text>
        </ModalHeader>
        <ModalContent>
          <div className={cn(layoutStyles.col, layoutStyles.gap6)}>
            <Text className={styles.body} size='large'>
              {messages.body}
            </Text>
            <div className={cn(layoutStyles.row, layoutStyles.gap2)}>
              <HarmonyButton
                className={styles.button}
                text={messages.cancel}
                variant={HarmonyButtonType.SECONDARY}
                onClick={closeModal}
              />
              <HarmonyButton
                className={styles.button}
                text={messages.proceed}
                variant={HarmonyButtonType.DESTRUCTIVE}
                onClick={handleConfirmNavigationClick}
              />
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}
