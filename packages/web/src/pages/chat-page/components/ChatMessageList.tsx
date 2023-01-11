import { ComponentPropsWithoutRef, useEffect } from 'react'

import { chatActions, chatSelectors } from '@audius/common'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'

import styles from './ChatMessageList.module.css'
import { ChatMessageListItem } from './ChatMessageListItem'

const { fetchNewChatMessages } = chatActions
const { getChatMessages } = chatSelectors

type ChatMessageListProps = ComponentPropsWithoutRef<'div'> & {
  chatId?: string
}

export const ChatMessageList = (props: ChatMessageListProps) => {
  const { chatId } = props
  const dispatch = useDispatch()
  const messages = useSelector((state) => getChatMessages(state, chatId ?? ''))

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
        messages?.map((message) => (
          <ChatMessageListItem
            key={message.message_id}
            chatId={chatId}
            message={message}
          />
        ))}
    </div>
  )
}
