import { useCallback, useEffect, useMemo } from 'react'

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
import { SearchUsersModal } from 'components/search-users-modal/SearchUsersModal'
import { MessageUserSearchResult } from 'pages/chat-page/components/CreateChatUserResult'

import { CreateChatEmptyResults } from './CreateChatEmptyResults'

const messages = {
  title: 'New Message'
}

const { getAccountUser } = accountSelectors
const { fetchBlockers } = chatActions

const CREATE_CHAT_MODAL = 'CreateChat'

const titleProps = { title: messages.title, icon: <IconCompose /> }

const renderUser = (user: User, closeModal: () => void) => (
  <MessageUserSearchResult
    key={user.user_id}
    user={user}
    closeModal={closeModal}
  />
)

const renderEmpty = () => <CreateChatEmptyResults />

export const CreateChatModal = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector(getAccountUser)
  const [isVisible] = useModalState(CREATE_CHAT_MODAL)

  const { userIds, loading, hasMore } = useSelector(
    followersUserListSelectors.getUserList
  )

  const loadMore = useCallback(() => {
    if (currentUser) {
      dispatch(followersUserListActions.setFollowers(currentUser?.user_id))
      dispatch(userListActions.loadMore(FOLLOWERS_USER_LIST_TAG))
    }
  }, [dispatch, currentUser])

  useEffect(() => {
    loadMore()
  }, [loadMore])

  useEffect(() => {
    if (isVisible) {
      dispatch(fetchBlockers())
    }
  }, [dispatch, isVisible])

  const defaultUserList = useMemo(
    () => ({
      userIds,
      loadMore,
      loading,
      hasMore
    }),
    [userIds, loadMore, loading, hasMore]
  )

  return (
    <SearchUsersModal
      modalName={CREATE_CHAT_MODAL}
      titleProps={titleProps}
      defaultUserList={defaultUserList}
      renderUser={renderUser}
      renderEmpty={renderEmpty}
    />
  )
}
