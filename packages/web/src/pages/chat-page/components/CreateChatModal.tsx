import { useCallback, useEffect, useState } from 'react'

import {
  accountSelectors,
  chatActions,
  userListActions,
  FOLLOWERS_USER_LIST_TAG,
  followersUserListActions,
  followersUserListSelectors,
  User,
  useCreateChatModal
} from '@audius/common'
import { IconCompose } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import { InboxUnavailableModal } from 'components/inbox-unavailable-modal/InboxUnavailableModal'
import { SearchUsersModal } from 'components/search-users-modal/SearchUsersModal'
import { MessageUserSearchResult } from 'pages/chat-page/components/CreateChatUserResult'

import { CreateChatEmptyResults } from './CreateChatEmptyResults'

const messages = {
  title: 'New Message'
}

const { getAccountUser } = accountSelectors
const { fetchBlockers } = chatActions

const CREATE_CHAT_MODAL = 'CreateChat'

export const CreateChatModal = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector(getAccountUser)
  const { isOpen, onOpen, onClose, onClosed, data } = useCreateChatModal()
  const { onCancelAction, presetMessage } = data
  const [user, setUser] = useState<User>()
  const [showInboxUnavailableModal, setShowInboxUnavailableModal] =
    useState(false)

  const { userIds, loading, hasMore } = useSelector(
    followersUserListSelectors.getUserList
  )

  const handleCancel = useCallback(() => {
    if (onCancelAction) {
      dispatch(onCancelAction)
    }
  }, [onCancelAction, dispatch])

  const loadMore = useCallback(() => {
    if (currentUser) {
      dispatch(followersUserListActions.setFollowers(currentUser?.user_id))
      dispatch(userListActions.loadMore(FOLLOWERS_USER_LIST_TAG))
    }
  }, [dispatch, currentUser])

  const handleOpenInboxUnavailableModal = useCallback(
    (user: User) => {
      setShowInboxUnavailableModal(true)
      setUser(user)
      onClose()
    },
    [setShowInboxUnavailableModal, setUser, onClose]
  )

  const handleDismissInboxUnavailableModal = useCallback(() => {
    onOpen(data)
  }, [onOpen, data])

  const handleCloseInboxUnavailableModal = useCallback(() => {
    setShowInboxUnavailableModal(false)
  }, [setShowInboxUnavailableModal])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchBlockers())
    }
  }, [dispatch, isOpen])

  return (
    <>
      <SearchUsersModal
        modalName={CREATE_CHAT_MODAL}
        titleProps={{ title: messages.title, icon: <IconCompose /> }}
        defaultUserList={{
          userIds,
          loadMore,
          loading,
          hasMore
        }}
        renderUser={(user, closeParentModal) => (
          <MessageUserSearchResult
            key={user.user_id}
            user={user}
            openInboxUnavailableModal={handleOpenInboxUnavailableModal}
            closeParentModal={closeParentModal}
            presetMessage={presetMessage}
          />
        )}
        renderEmpty={() => <CreateChatEmptyResults />}
        onClose={onClose}
        onClosed={onClosed}
        onCancel={handleCancel}
      />
      {user ? (
        <InboxUnavailableModal
          user={user}
          isVisible={showInboxUnavailableModal}
          onDismiss={handleDismissInboxUnavailableModal}
          onClose={handleCloseInboxUnavailableModal}
        />
      ) : null}
    </>
  )
}
