import { useCallback, useState } from 'react'

import {
  chatActions,
  ID,
  searchUserListActions,
  searchUserListSelectors,
  SEARCH_USER_LIST_TAG,
  userListActions
} from '@audius/common'
import {
  Button,
  ButtonSize,
  ButtonType,
  IconMail,
  Modal,
  ModalHeader,
  ModalTitle,
  Scrollbar
} from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
import Input from 'components/data-entry/Input'
import ConnectedUserList from 'components/user-list/UserList'

import styles from './CreateChatModal.module.css'

const { getUserList } = searchUserListSelectors
const { createChat } = chatActions

const messages = {
  title: 'New Message',
  searchUsers: 'Search Users',
  message: 'Message'
}
const CHAT_COMPOSE_TAG = 'CHAT_COMPOSE'

export const CreateChatModal = () => {
  const dispatch = useDispatch()
  const [isVisible, setIsVisible] = useModalState('ChatCompose')
  const [pendingUserChat, setPendingUserChat] = useState<number>()
  const [query, setQuery] = useState('')

  const doSearch = useCallback(() => {
    dispatch(searchUserListActions.setSearchQuery(query))
    dispatch(userListActions.reset(SEARCH_USER_LIST_TAG))
    dispatch(userListActions.loadMore(SEARCH_USER_LIST_TAG))
  }, [query, dispatch])

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
      doSearch()
    },
    [setQuery, doSearch]
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
        <ModalTitle icon={<IconMail />} title={messages.title} />
      </ModalHeader>
      <div className={styles.modalContent}>
        <div className={styles.search}>
          <Input placeholder={messages.searchUsers} onChange={handleChange} />
        </div>
        <div className={styles.results}>
          <Scrollbar className={styles.scrollbar}>
            <ConnectedUserList
              tag={CHAT_COMPOSE_TAG}
              stateSelector={getUserList}
              onNavigateAway={handleClose}
              beforeClickArtistName={handleClose}
              renderActionButton={(userId: ID) => (
                <Button
                  type={ButtonType.PRIMARY_ALT}
                  size={ButtonSize.SMALL}
                  text={messages.message}
                  isDisabled={pendingUserChat === userId}
                  disabled={pendingUserChat === userId}
                  onClick={() => handleCreateChat(userId)}
                />
              )}
            />
          </Scrollbar>
        </div>
      </div>
    </Modal>
  )
}
