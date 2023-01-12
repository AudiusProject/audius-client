import { ComponentPropsWithoutRef, useEffect } from 'react'

import { chatActions, chatSelectors } from '@audius/common'
import type { ChatMessage, UserChat } from '@audius/sdk'
import cn from 'classnames'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'

import styles from './ChatMessageList.module.css'
import { ChatMessageListItem } from './ChatMessageListItem'

const { fetchNewChatMessages } = chatActions
const { getChatMessages, getChats } = chatSelectors

const messages = {
  newMessages: 'New Messages'
}

type ChatMessageListProps = ComponentPropsWithoutRef<'div'> & {
  chatId?: string
}

const MESSAGE_GROUP_THRESHOLD = 2

/**
 * Checks to see if the message was sent within the time threshold for grouping it with the next message
 */
const hasTail = (message: ChatMessage, newMessage?: ChatMessage) => {
  if (!newMessage) return true
  return (
    message.sender_user_id !== newMessage.sender_user_id ||
    dayjs(newMessage.created_at).diff(message.created_at, 'minutes') >=
      MESSAGE_GROUP_THRESHOLD
  )
}

/**
 * Checks if the current message is the first unread message in the given chat
 * Used to render the new messages separator indicator
 */
const isFirstUnread = (
  chat: UserChat,
  message: ChatMessage,
  prevMessage?: ChatMessage
) =>
  message.created_at > chat.last_read_at &&
  (!prevMessage || prevMessage.created_at <= chat.last_read_at)

export const ChatMessageList = (props: ChatMessageListProps) => {
  const { chatId } = props
  const dispatch = useDispatch()
  const chatMessages = useSelector((state) =>
    getChatMessages(state, chatId ?? '')
  )
  const { data: chats } = useSelector(getChats)
  const chat = chatId ? chats.find((chat) => chat.chat_id === chatId) : null

  useEffect(() => {
    if (chatId) {
      dispatch(fetchNewChatMessages({ chatId }))
    }
    const pollInterval = setInterval(() => {
      if (chatId) {
        dispatch(fetchNewChatMessages({ chatId }))
      }
    }, 100000000000000000)
    return () => {
      clearInterval(pollInterval)
    }
  }, [dispatch, chatId])

  return (
    <div className={cn(styles.root, props.className)}>
      {chatId &&
        chatMessages?.map((message, i) => (
          <>
            <ChatMessageListItem
              key={message.message_id}
              chatId={chatId}
              message={message}
              hasTail={hasTail(message, chatMessages[i - 1])}
            />
            {/* 
              The separator has to come after the message to appear before it, 
              since the message list order is reversed in CSS
            */}
            {chat && isFirstUnread(chat, message, chatMessages[i + 1]) ? (
              <div className={styles.separator}>
                <span className={styles.tag}>
                  {chat.unread_message_count} {messages.newMessages}
                </span>
              </div>
            ) : null}
          </>
        ))}
    </div>
  )
}
