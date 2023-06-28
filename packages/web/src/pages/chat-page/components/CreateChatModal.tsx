import { useCallback, useEffect, useState } from 'react'

import {
  accountSelectors,
  chatActions,
  userListActions,
  FOLLOWERS_USER_LIST_TAG,
  followersUserListActions,
  followersUserListSelectors,
  User
} from '@audius/common'
import { IconCompose } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useModalState } from 'common/hooks/useModalState'
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
  const [isVisible, setIsVisible] = useModalState(CREATE_CHAT_MODAL)
  const [user, setUser] = useState<User>()
  const [showInboxUnavailableModal, setShowInboxUnavailableModal] =
    useState(false)

  const { userIds, loading, hasMore } = useSelector(
    followersUserListSelectors.getUserList
  )

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
      setIsVisible(false)
    },
    [setShowInboxUnavailableModal, setUser, setIsVisible]
  )

  const handleDismissInboxUnavailableModal = useCallback(() => {
    setIsVisible(true)
  }, [setIsVisible])

  const handleCloseInboxUnavailableModal = useCallback(() => {
    setShowInboxUnavailableModal(false)
  }, [setShowInboxUnavailableModal])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    if (isVisible) {
      dispatch(fetchBlockers())
    }
  }, [dispatch, isVisible])

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
        renderUser={(user, closeParentModal, listRef) => (
          <MessageUserSearchResult
            key={user.user_id}
            user={user}
            openInboxUnavailableModal={handleOpenInboxUnavailableModal}
            closeParentModal={closeParentModal}
            listRef={listRef}
          />
        )}
        renderEmpty={() => <CreateChatEmptyResults />}
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
