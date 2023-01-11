import { accountSelectors, decodeHashId } from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import cn from 'classnames'
import dayjs from 'dayjs'

import { useSelector } from 'common/hooks/useSelector'

import styles from './ChatMessageListItem.module.css'

type ChatMessageListItemProps = {
  message: ChatMessage
}

const formatMessageDate = (date: string) => {
  const d = dayjs(date)
  const today = dayjs()
  if (d.isBefore(today, 'week')) return d.format('M/D/YY h:mm A')
  if (d.isBefore(today, 'day')) return d.format('dddd h:mm A')
  return d.format('h:mm A')
}

export const ChatMessageListItem = (props: ChatMessageListItemProps) => {
  const { message } = props
  const senderUserId = decodeHashId(message.sender_user_id)
  const userId = useSelector(accountSelectors.getUserId)
  const isAuthor = userId === senderUserId
  return (
    <div
      className={cn(styles.root, {
        [styles.isAuthor]: isAuthor
      })}
    >
      <div className={styles.bubble}>
        <div className={styles.text}>{message.message}</div>
      </div>
      <div className={styles.date}>{formatMessageDate(message.created_at)}</div>
    </div>
  )
}
