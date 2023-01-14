import { useCallback, useEffect, useRef } from 'react'

import {
  chatActions,
  chatSelectors,
  FeatureFlags,
  Status,
  useProxySelector
} from '@audius/common'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import useMeasure from 'react-use-measure'

import { useSelector } from 'common/hooks/useSelector'
import Page from 'components/page/Page'
import { useFlag } from 'hooks/useRemoteConfig'
import { chatPage } from 'utils/route'

import styles from './ChatPage.module.css'
import { ChatComposer } from './components/ChatComposer'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatMessageList } from './components/ChatMessageList'
import { CreateChatPrompt } from './components/CreateChatPrompt'

const { getOtherChatUsers, getChatMessagesStatus } = chatSelectors
const { markChatAsRead } = chatActions

const messages = {
  messages: 'Messages'
}

export const ChatPage = ({ match }: RouteComponentProps<{ id?: string }>) => {
  const currentChatId = match.params.id
  const dispatch = useDispatch()
  const { isEnabled: isChatEnabled } = useFlag(FeatureFlags.CHAT_ENABLED)
  const users = useProxySelector(
    (state) => getOtherChatUsers(state, currentChatId),
    [currentChatId]
  )
  const messagesStatus = useSelector((state) =>
    currentChatId ? getChatMessagesStatus(state, currentChatId) : Status.IDLE
  )

  // Get the height of the header so we can slide the messages list underneath it for the blur effect
  const [headerRef, bounds] = useMeasure({
    polyfill: ResizeObserver,
    offsetSize: true
  })
  const messagesRef = useRef<HTMLDivElement>(null)

  // Cache whether the user was already scrolled to the bottom
  // Effects run after the render, so we can't calculate this inside the effect
  // but without rendering, there's nowhere to scroll, so do that within the effect
  let wasAtBottom = false
  if (messagesRef.current) {
    const { scrollTop, clientHeight, scrollHeight } = messagesRef.current
    wasAtBottom = scrollTop + clientHeight >= scrollHeight
  }

  // Navigate to new chats
  // Scroll to bottom if active chat is clicked again
  const handleChatClicked = useCallback(
    (chatId: string) => {
      if (chatId !== currentChatId) {
        dispatch(pushRoute(chatPage(chatId)))
      } else {
        messagesRef.current?.scrollTo({
          top: messagesRef.current?.scrollHeight,
          behavior: 'smooth'
        })
      }
    },
    [messagesRef, currentChatId, dispatch]
  )

  // Keep the user scrolled at the bottom for when new messages come in, provided they were already at the bottom
  // Also mark the chat as read
  useEffect(() => {
    if (messagesStatus === Status.SUCCESS && wasAtBottom) {
      messagesRef.current?.scrollTo({
        top: messagesRef.current?.scrollHeight
      })
      if (currentChatId) {
        dispatch(markChatAsRead({ chatId: currentChatId }))
      }
    }
  }, [messagesStatus, currentChatId, wasAtBottom, dispatch])

  if (!isChatEnabled) {
    return null
  }
  return (
    <Page
      title={`${users.length > 0 ? users[0].name + ' •' : ''} ${
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
              <div
                ref={messagesRef}
                className={styles.messages}
                style={{
                  marginTop: `${-bounds.height}px`,
                  paddingTop: `${bounds.height}px`
                }}
              >
                <ChatMessageList
                  className={styles.messageList}
                  chatId={currentChatId}
                />
              </div>
              <ChatComposer chatId={currentChatId} />
            </>
          ) : (
            <CreateChatPrompt />
          )}
        </div>
      </div>
    </Page>
  )
}
