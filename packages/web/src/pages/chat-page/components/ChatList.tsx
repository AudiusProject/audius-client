import { ComponentPropsWithoutRef, useEffect } from 'react'

import { chatSelectors, chatActions } from '@audius/common'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'

import styles from './ChatList.module.css'
import { ChatListItem } from './ChatListItem'

type ChatListProps = {
  currentChatId?: string
} & ComponentPropsWithoutRef<'div'>

export const ChatList = (props: ChatListProps) => {
  const dispatch = useDispatch()
  const chats = useSelector(chatSelectors.getChats)

  useEffect(() => {
    dispatch(chatActions.fetchMoreChats())
  }, [dispatch])

  return (
    <div className={cn(styles.root, props.className)}>
      {chats?.map((chat) => (
        <ChatListItem
          key={chat.chat_id}
          currentChatId={props.currentChatId}
          chat={chat}
        />
      ))}
    </div>
  )
}
