import { useCallback, useEffect, useRef } from 'react'

import { chatActions, FeatureFlags, useCanSendMessage } from '@audius/common'
import { ResizeObserver } from '@juggle/resize-observer'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'
import useMeasure from 'react-use-measure'

import Page from 'components/page/Page'
import { useFlag } from 'hooks/useRemoteConfig'
import { chatPage } from 'utils/route'

import { ChatComposer } from './ChatComposer'
import { ChatHeader } from './ChatHeader'
import { ChatList } from './ChatList'
import { ChatMessageList } from './ChatMessageList'
import styles from './ChatPage.module.css'
import { CreateChatPrompt } from './CreateChatPrompt'

const { fetchPermissions } = chatActions

const messages = {
  messages: 'Messages'
}

export const ChatPage = ({ currentChatId }: { currentChatId?: string }) => {
  const dispatch = useDispatch()
  const { isEnabled: isChatEnabled } = useFlag(FeatureFlags.CHAT_ENABLED)
  const { firstOtherUser, canSendMessage } = useCanSendMessage(currentChatId)

  // Get the height of the header so we can slide the messages list underneath it for the blur effect
  const [headerRef, headerBounds] = useMeasure({
    polyfill: ResizeObserver,
    offsetSize: true
  })
  const messagesRef = useRef<HTMLDivElement>(null)

  // Navigate to new chats
  // Scroll to bottom if active chat is clicked again
  const handleChatClicked = useCallback(
    (chatId: string) => {
      if (chatId !== currentChatId) {
        dispatch(pushRoute(chatPage(chatId)))
      } else {
        messagesRef.current?.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
    },
    [messagesRef, currentChatId, dispatch]
  )

  const handleMessageSent = useCallback(() => {
    // Set a timeout so that the date etc has a chance to render first
    setTimeout(() => {
      messagesRef.current?.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }, 0)
  }, [messagesRef])

  useEffect(() => {
    if (firstOtherUser) {
      dispatch(fetchPermissions({ userIds: [firstOtherUser.user_id] }))
    }
  }, [dispatch, firstOtherUser])

  if (!isChatEnabled) {
    return null
  }
  return (
    <Page
      title={`${firstOtherUser ? firstOtherUser.name + ' •' : ''} ${
        messages.messages
      }`}
      containerClassName={styles.page}
      contentClassName={styles.pageContent}
      showSearch={false}
      header={<ChatHeader ref={headerRef} currentChatId={currentChatId} />}
    >
      <div className={styles.layout}>
        <div className={styles.chatList}>
          <ChatList
            className={styles.chatList}
            currentChatId={currentChatId}
            onChatClicked={handleChatClicked}
          />
        </div>
        <div className={styles.chatArea}>
          {currentChatId ? (
            <>
              <ChatMessageList
                ref={messagesRef}
                style={{
                  marginTop: `-${headerBounds.height}px`,
                  paddingTop: `${headerBounds.height}px`,
                  scrollPaddingTop: `${headerBounds.height}px`
                }}
                className={styles.messageList}
                chatId={currentChatId}
              />
              {canSendMessage ? (
                <ChatComposer
                  chatId={currentChatId}
                  onMessageSent={handleMessageSent}
                />
              ) : null}
            </>
          ) : (
            <CreateChatPrompt />
          )}
        </div>
      </div>
    </Page>
  )
}
