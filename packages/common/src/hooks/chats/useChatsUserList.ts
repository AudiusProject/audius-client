import { useSelector } from 'react-redux'

import { Status } from 'models/Status'
import { getUserId } from 'store/account/selectors'
import {
  getChats,
  getChatsStatus,
  getHasMoreChats
} from 'store/pages/chat/selectors'
import { decodeHashId } from 'utils/hashIds'
import { removeNullable } from 'utils/typeUtils'

export const useChatsUserList = () => {
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
