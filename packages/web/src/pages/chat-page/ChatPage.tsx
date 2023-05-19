import { useCallback, useEffect, useRef } from 'react'

import {
  chatActions,
  ChatPermissionAction,
  chatSelectors,
  FeatureFlags,
  useProxySelector,
  User
} from '@audius/common'
import { ResizeObserver } from '@juggle/resize-observer'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'
import useMeasure from 'react-use-measure'

import { useSelector } from 'common/hooks/useSelector'
import Page from 'components/page/Page'
import { UserNameAndBadges } from 'components/user-name-and-badges/UserNameAndBadges'
import { useFlag } from 'hooks/useRemoteConfig'
import { chatPage } from 'utils/route'

import styles from './ChatPage.module.css'
import { ChatComposer } from './components/ChatComposer'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatMessageList } from './components/ChatMessageList'
import { CreateChatPrompt } from './components/CreateChatPrompt'

const { getOtherChatUsers, getCanCreateChat, getChat } = chatSelectors
const { connect, disconnect, fetchPermissions } = chatActions

const messages = {
  messages: 'Messages'
}

const InboxUnavailableMessage = ({
  user,
  action
}: {
  user: User
  action: ChatPermissionAction
}) => {
  switch (action) {
    case ChatPermissionAction.TIP:
      return (
        <div className={styles.inboxUnavailableMessage}>
          You must send <UserNameAndBadges user={user} /> a tip before you can
          send them messages.
        </div>
      )
    case ChatPermissionAction.UNBLOCK:
      return (
        <div className={styles.inboxUnavailableMessage}>
          You cannot send messages to users you have blocked.{' '}
          <a href='#' target='_blank'>
            Learn More.
          </a>
        </div>
      )
    default:
      return (
        <div className={styles.inboxUnavailableMessage}>
          You can no longer send messages to <UserNameAndBadges user={user} />{' '}
          <a href='#' target='_blank'>
            Learn More.
          </a>
        </div>
      )
  }
}

export const ChatPage = ({ match }: RouteComponentProps<{ id?: string }>) => {
  const currentChatId = match.params.id
  const dispatch = useDispatch()
  const { isEnabled: isChatEnabled } = useFlag(FeatureFlags.CHAT_ENABLED)
  const users = useProxySelector(
    (state) => getOtherChatUsers(state, currentChatId),
    [currentChatId]
  )
  const { canCreateChat, callToAction } = useSelector((state) =>
    getCanCreateChat(state, users[0]?.user_id)
  )
  const chat = useSelector(getChat)

  console.log({
    recheck: chat?.recheck_permissions,
    canCreateChat,
    action: ChatPermissionAction[callToAction].toString()
  })
  const canChat =
    (!chat?.recheck_permissions || canCreateChat) &&
    !(
      callToAction === ChatPermissionAction.NONE ||
      callToAction === ChatPermissionAction.UNBLOCK
    )

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
          top: messagesRef.current?.scrollHeight,
          behavior: 'smooth'
        })
      }
    },
    [messagesRef, currentChatId, dispatch]
  )

  useEffect(() => {
    dispatch(connect())
    return () => {
      dispatch(disconnect())
    }
  }, [dispatch])

  useEffect(() => {
    if (users[0]?.user_id) {
      dispatch(fetchPermissions({ userIds: [users[0].user_id] }))
    }
  }, [dispatch, users])

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
              {canChat ? (
                <ChatComposer chatId={currentChatId} />
              ) : users.length > 0 ? (
                <InboxUnavailableMessage
                  user={users[0]}
                  action={callToAction}
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
