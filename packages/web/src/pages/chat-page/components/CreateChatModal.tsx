import { useCallback, useEffect } from 'react'

import {
  accountSelectors,
  chatActions,
  userListActions,
  FOLLOWERS_USER_LIST_TAG,
  followersUserListActions,
  followersUserListSelectors,
  User,
  useCreateChatModal,
  useInboxUnavailableModal,
  createChatModalActions,
  searchUsersModalActions,
  chatSelectors,
  decodeHashId,
  removeNullable,
  Status
} from '@audius/common'
import { IconCompose } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import { SearchUsersModal } from 'components/search-users-modal/SearchUsersModal'
import { CreateChatUserResult } from 'pages/chat-page/components/CreateChatUserResult'

import { CreateChatEmptyResults } from './CreateChatEmptyResults'

const messages = {
  title: 'New Message'
}

const { getAccountUser, getUserId } = accountSelectors
const { fetchBlockers, fetchMoreChats } = chatActions
const { getChats, getHasMoreChats, getChatsStatus } = chatSelectors

const useChatsUserList = () => {
  const currentUserId = useSelector(getUserId)
  const chats = useSelector(getChats)
  const hasMoreChats = useSelector(getHasMoreChats)
  const chatsStatus = useSelector(getChatsStatus)
  const chatUserListIds = chats
    .map(
      (c) =>
        c.chat_members
          .filter((u) => decodeHashId(u.user_id) !== currentUserId)
          .map((u) => decodeHashId(u.user_id))[0]
    )
    .filter(removeNullable)
  return {
    userIds: chatUserListIds,
    hasMore: hasMoreChats,
    loading: chatsStatus === Status.LOADING
  }
}

export const CreateChatModal = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector(getAccountUser)
  const { isOpen, onClose, onClosed, data } = useCreateChatModal()
  const { onOpen: openInboxUnavailableModal } = useInboxUnavailableModal()
  const { onCancelAction, presetMessage, defaultUserList } = data

  const followersUserList = useSelector(followersUserListSelectors.getUserList)
  const chatsUserList = useChatsUserList()
  const { userIds, hasMore, loading } =
    defaultUserList === 'chats' ? chatsUserList : followersUserList

  const handleCancel = useCallback(() => {
    if (onCancelAction) {
      dispatch(onCancelAction)
    }
  }, [onCancelAction, dispatch])

  const loadMore = useCallback(() => {
    if (currentUser) {
      if (defaultUserList === 'chats') {
        dispatch(fetchMoreChats())
      } else {
        dispatch(followersUserListActions.setFollowers(currentUser?.user_id))
        dispatch(userListActions.loadMore(FOLLOWERS_USER_LIST_TAG))
      }
    }
  }, [dispatch, defaultUserList, currentUser])

  const handleOpenInboxUnavailableModal = useCallback(
    (user: User) => {
      openInboxUnavailableModal({
        userId: user.user_id,
        presetMessage,
        onSuccessAction: searchUsersModalActions.searchUsers({ query: '' }),
        onCancelAction: createChatModalActions.open(data)
      })
      onClose()
    },
    [data, presetMessage, openInboxUnavailableModal, onClose]
  )

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
        titleProps={{ title: messages.title, icon: <IconCompose /> }}
        defaultUserList={{
          userIds,
          loadMore,
          loading,
          hasMore
        }}
        renderUser={(user, closeParentModal) => (
          <CreateChatUserResult
            key={user.user_id}
            user={user}
            openInboxUnavailableModal={handleOpenInboxUnavailableModal}
            closeParentModal={closeParentModal}
            presetMessage={presetMessage}
          />
        )}
        renderEmpty={() => <CreateChatEmptyResults />}
        isOpen={isOpen}
        onClose={onClose}
        onClosed={onClosed}
        onCancel={handleCancel}
      />
    </>
  )
}
