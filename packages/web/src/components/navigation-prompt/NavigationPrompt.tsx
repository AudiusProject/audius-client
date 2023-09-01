import React, { useEffect, useState } from 'react'

import { Modal, ModalContent, ModalHeader, ModalTitle } from '@audius/stems'
import { Location } from 'history'
import { Prompt } from 'react-router-dom'

import ConfirmationBox from 'components/confirmation-box/ConfirmationBox'
import { useNavigateToPage } from 'hooks/useNavigateToPage'

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
const RouteLeavingGuard = (props: Props) => {
  const { when, shouldBlockNavigation, messages } = props
  const [modalVisible, setModalVisible] = useState(false)
  const [lastLocation, setLastLocation] = useState<Location | null>(null)
  const [confirmedNavigation, setConfirmedNavigation] = useState(false)
  const navigate = useNavigateToPage()

  const closeModal = () => {
    setModalVisible(false)
  }

  const handleBlockedNavigation = (nextLocation: Location): boolean => {
    if (
      !confirmedNavigation &&
      (!shouldBlockNavigation || shouldBlockNavigation?.(nextLocation))
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
          <ModalTitle title={messages.title} />
        </ModalHeader>
        <ModalContent>
          <ConfirmationBox
            text={messages.body}
            leftText={messages.cancel}
            rightText={messages.proceed}
            leftClick={closeModal}
            rightClick={handleConfirmNavigationClick}
          />
        </ModalContent>
      </Modal>
    </>
  )
}
export default RouteLeavingGuard
