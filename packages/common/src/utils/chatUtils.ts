import type { ChatMessage } from '@audius/sdk'
import dayjs from 'dayjs'

import { MESSAGE_GROUP_THRESHOLD_MINUTES } from './constants'

/**
 * Checks to see if the message was sent within the time threshold for grouping it with the next message
 */
export const hasTail = (message: ChatMessage, newMessage?: ChatMessage) => {
  if (!newMessage) return true
  return (
    message.sender_user_id !== newMessage.sender_user_id ||
    dayjs(newMessage.created_at).diff(message.created_at, 'minutes') >=
      MESSAGE_GROUP_THRESHOLD_MINUTES
  )
}

/**
 * Checks if the current message:
 * - Is the first unread message
 * - Is by a different user than the current one
 */
export const isEarliestUnread = ({
  unreadCount,
  lastReadAt,
  currentMessageIndex,
  messages,
  currentUserId
}: {
  unreadCount: number
  lastReadAt?: string
  currentMessageIndex: number
  messages: ChatMessage[]
  currentUserId: string | null
}) => {
  if (unreadCount === 0 || !lastReadAt) {
    return false
  }
  const message = messages[currentMessageIndex]
  const prevMessage = messages[currentMessageIndex + 1]
  const isUnread =
    lastReadAt === undefined || dayjs(message.created_at).isAfter(lastReadAt)
  const isPreviousMessageUnread =
    prevMessage &&
    (lastReadAt === undefined ||
      dayjs(prevMessage.created_at).isAfter(lastReadAt))
  const isAuthor = message.sender_user_id === currentUserId
  return isUnread && !isPreviousMessageUnread && !isAuthor
}
