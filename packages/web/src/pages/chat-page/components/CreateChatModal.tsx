import { useCallback, useState } from 'react'

import { chatActions, ID } from '@audius/common'
import {
  IconCompose,
  Modal,
  ModalHeader,
  ModalTitle,
  Scrollbar
} from '@audius/stems'
import { useDispatch } from 'react-redux'
import { useDebounce } from 'react-use'

import { useModalState } from 'common/hooks/useModalState'
import Input from 'components/data-entry/Input'

import styles from './CreateChatModal.module.css'

const { createChat } = chatActions

const messages = {
  title: 'New Message',
  searchUsers: 'Search Users',
  message: 'Message'
}
const DEBOUNCE_MS = 250

export const CreateChatModal = () => {
  const dispatch = useDispatch()
  const [isVisible, setIsVisible] = useModalState('ChatCompose')
  const [pendingUserChat, setPendingUserChat] = useState<number>()
  const [query, setQuery] = useState('')

  useDebounce(
    () => {
      // TODO: Do query
    },
    DEBOUNCE_MS,
    [query, dispatch]
  )

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
    },
    [setQuery]
  )

  const handleClose = useCallback(() => {
    setIsVisible(false)
  }, [setIsVisible])

  const handleCreateChat = useCallback(
    (userId: ID) => {
      setPendingUserChat(userId)
      dispatch(createChat({ userIds: [userId] }))
    },
    [dispatch]
  )

  return (
    <Modal
      isOpen={isVisible}
      onClose={handleClose}
      onClosed={() => setPendingUserChat(undefined)}
    >
      <ModalHeader onClose={handleClose}>
        <ModalTitle
          icon={<IconCompose className={styles.icon} />}
          title={messages.title}
        />
      </ModalHeader>
      <div className={styles.modalContent}>
        <div className={styles.search}>
          <Input placeholder={messages.searchUsers} onChange={handleChange} />
        </div>
        <div className={styles.results}>
          <Scrollbar className={styles.scrollbar}>
            {/* TODO: list users */}
          </Scrollbar>
        </div>
      </div>
    </Modal>
  )
}
