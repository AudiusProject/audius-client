import { useCallback } from 'react'

import { chatSelectors, useProxySelector } from '@audius/common'
import type { UserChat } from '@audius/sdk'
import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { useRouteMatch } from 'hooks/useRouteMatch'
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
  const match = useRouteMatch(chatPage(chat.chat_id))
  const isCurrentChat = currentChatId && currentChatId === chat.chat_id

  const users = useProxySelector(
    (state) => getOtherChatUsersFromChat(state, chat),
    [chat]
  )

  const handleClick = useCallback(() => {
    if (!match) {
      dispatch(push(chatPage(chat.chat_id)))
    } else {
      const mainContent = document.getElementById('mainContent')
      mainContent?.scrollTo({
        top: mainContent?.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [dispatch, chat, match])

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
