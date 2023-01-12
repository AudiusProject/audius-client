import { useCallback } from 'react'

import { chatSelectors, useProxySelector } from '@audius/common'
import type { UserChat } from '@audius/sdk'
import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { chatPage } from 'utils/route'

import styles from './ChatListItem.module.css'
import { ChatUser } from './ChatUser'

const { getOtherChatUsersFromChat } = chatSelectors

type ChatListItemProps = {
  currentChatId?: string
  chat: UserChat
}

export const ChatListItem = (props: ChatListItemProps) => {
  const { chat, currentChatId } = props
  const dispatch = useDispatch()
  const isCurrentChat = currentChatId && currentChatId === chat.chat_id

  const users = useProxySelector(
    (state) => getOtherChatUsersFromChat(state, chat),
    [chat]
  )

  const handleClick = useCallback(() => {
    dispatch(push(chatPage(chat.chat_id)))
  }, [dispatch, chat])

  if (users.length === 0) {
    return null
  }
  return (
    <div
      className={cn(styles.root, { [styles.active]: isCurrentChat })}
      onClick={handleClick}
    >
      <ChatUser user={users[0]} textClassName={styles.userText}>
        {chat.unread_message_count > 0 ? (
          <div className={styles.unreadIndicatorTag}>
            {chat.unread_message_count > 9 ? '9+' : chat.unread_message_count}{' '}
            New
          </div>
        ) : null}
      </ChatUser>
      <div className={styles.messagePreview}>(TODO: Message preview here)</div>
    </div>
  )
}
