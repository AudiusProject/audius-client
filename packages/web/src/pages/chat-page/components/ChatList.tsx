import { ComponentPropsWithoutRef, useEffect, useState } from 'react'

import { chatSelectors, chatActions, Status } from '@audius/common'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './ChatList.module.css'
import { ChatListItem } from './ChatListItem'

const { getChatsResponse } = chatSelectors
const { fetchMoreChats } = chatActions

const messages = {
  nothingHere: 'Nothing Here Yet',
  start: 'Start a Conversation!'
}

type ChatListProps = {
  currentChatId?: string
} & ComponentPropsWithoutRef<'div'>

export const ChatList = (props: ChatListProps) => {
  const dispatch = useDispatch()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const chatsState = useSelector(getChatsResponse)
  const chats = chatsState.data

  useEffect(() => {
    dispatch(fetchMoreChats())
  }, [dispatch])

  useEffect(() => {
    if (chatsState.status === Status.SUCCESS) {
      setHasLoadedOnce(true)
    }
  }, [chatsState, setHasLoadedOnce])

  return (
    <div className={cn(styles.root, props.className)}>
      {chats?.length > 0 ? (
        chats?.map((chat) => (
          <ChatListItem
            key={chat.chat_id}
            currentChatId={props.currentChatId}
            chat={chat}
          />
        ))
      ) : hasLoadedOnce ? (
        <div className={styles.empty}>
          <div className={styles.header}>{messages.nothingHere}</div>
          <div className={styles.subheader}>{messages.start}</div>
        </div>
      ) : null}
      {chatsState.status === Status.LOADING ? (
        <LoadingSpinner className={styles.spinner} />
      ) : null}
    </div>
  )
}
