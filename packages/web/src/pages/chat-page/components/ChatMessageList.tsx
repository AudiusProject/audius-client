import {
  ComponentPropsWithoutRef,
  Fragment,
  useCallback,
  UIEvent,
  useEffect,
  forwardRef,
  useRef,
  useLayoutEffect,
  useState
} from 'react'

import {
  accountSelectors,
  chatActions,
  chatSelectors,
  encodeHashId,
  Status,
  hasTail
} from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './ChatMessageList.module.css'
import { ChatMessageListItem } from './ChatMessageListItem'
import { StickyScrollList } from './StickyScrollList'

const { fetchMoreMessages, markChatAsRead, setActiveChat } = chatActions
const {
  getChatMessages,
  getChatMessagesStatus,
  getChatMessagesSummary,
  getChat
} = chatSelectors

const messages = {
  newMessages: 'New Messages'
}

type ChatMessageListProps = ComponentPropsWithoutRef<'div'> & {
  chatId?: string
}

const SCROLL_TOP_THRESHOLD = 800

const isScrolledToBottom = (element: HTMLElement) => {
  const { scrollTop, clientHeight, scrollHeight } = element
  return scrollTop + clientHeight >= scrollHeight
}

const isScrolledToTop = (element: HTMLElement) => {
  return element.scrollTop < SCROLL_TOP_THRESHOLD
}

/**
 * Checks if the current message:
 * - Is the first unread message
 * - Is by a different user than the current one
 */
const shouldRenderUnreadIndicator = (
  unreadCount: number,
  lastReadAt: string | undefined,
  currentMessageIndex: number,
  messages: ChatMessage[],
  currentUserId: string | null
) => {
  if (unreadCount === 0 || !lastReadAt) {
    return false
  }
  const message = messages[currentMessageIndex]
  const prevMessage = messages[currentMessageIndex + 1]
  const isUnread = message.created_at > lastReadAt
  const isPreviousMessageUnread =
    prevMessage && prevMessage.created_at > lastReadAt
  const isAuthor = message.sender_user_id === currentUserId
  return isUnread && !isPreviousMessageUnread && !isAuthor
}

export const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  (props, forwardedRef) => {
    const { chatId, className: classNameProp, ...other } = props
    const dispatch = useDispatch()
    const chatMessages = useSelector((state) =>
      getChatMessages(state, chatId ?? '')
    )
    const summary = useSelector((state) =>
      getChatMessagesSummary(state, chatId ?? '')
    )
    const status = useSelector((state) =>
      getChatMessagesStatus(state, chatId ?? '')
    )
    const chat = useSelector((state) => getChat(state, chatId))
    const userId = useSelector(accountSelectors.getUserId)
    const currentUserId = encodeHashId(userId)
    const [unreadIndicatorEl, setUnreadIndicatorEl] =
      useState<HTMLDivElement | null>(null)
    const [, setLastScrolledChatId] = useState<string>()

    // A ref so that the unread separator doesn't disappear immediately when the chat is marked as read
    // Using a ref instead of state here to prevent unwanted flickers.
    // The chat/chatId selectors will trigger the rerenders necessary.
    const chatFrozenRef = useRef(chat)
    useLayoutEffect(() => {
      if (chat && chatId !== chatFrozenRef.current?.chat_id) {
        // Update the unread indicator when chatId changes
        chatFrozenRef.current = chat
      }
    }, [chat, chatId])

    const handleScroll = useCallback(
      (e: UIEvent<HTMLDivElement>) => {
        if (chatId && isScrolledToBottom(e.currentTarget)) {
          // Mark chat as read when the user reaches the bottom (saga handles no-op if already read)
          dispatch(markChatAsRead({ chatId }))
          dispatch(setActiveChat({ chatId }))
        } else {
          dispatch(setActiveChat({ chatId: null }))
          if (
            chatId &&
            isScrolledToTop(e.currentTarget) &&
            status !== Status.LOADING
          ) {
            // Fetch more messages when user reaches the top
            dispatch(fetchMoreMessages({ chatId }))
          }
        }
      },
      [dispatch, chatId, status]
    )

    const scrollIntoViewOnMount = useCallback((el: HTMLDivElement) => {
      if (el) {
        el.scrollIntoView()
        // On initial render, can't scroll yet, as the component isn't fully rendered.
        // Instead, queue a scroll by triggering a rerender via a state change.
        setUnreadIndicatorEl(el)
      }
    }, [])

    useLayoutEffect(() => {
      if (unreadIndicatorEl) {
        unreadIndicatorEl.scrollIntoView()
        // One more state change, this keeps chats unread until the user scrolls to the bottom on their own
        setLastScrolledChatId(chatId)
      }
    }, [unreadIndicatorEl, chatId, setLastScrolledChatId])

    useEffect(() => {
      if (chatId && status === Status.IDLE) {
        // Initial fetch
        dispatch(fetchMoreMessages({ chatId }))
        dispatch(setActiveChat({ chatId }))
      }
    }, [dispatch, chatId, status])

    return (
      <StickyScrollList
        ref={forwardedRef}
        onScroll={handleScroll}
        className={cn(styles.root, classNameProp)}
        resetKey={chatId}
        updateKey={chatMessages}
        stickToBottom
        {...other}
      >
        <div className={styles.listRoot}>
          {chatId &&
            chatMessages?.map((message, i) => (
              <Fragment key={message.message_id}>
                <ChatMessageListItem
                  chatId={chatId}
                  message={message}
                  hasTail={hasTail(message, chatMessages[i - 1])}
                />
                {/* 
                  The separator has to come after the message to appear above it, 
                  since the message list order is reversed in CSS
                */}
                {shouldRenderUnreadIndicator(
                  chatFrozenRef.current?.unread_message_count ?? 0,
                  chatFrozenRef.current?.last_read_at,
                  i,
                  chatMessages,
                  currentUserId
                ) ? (
                  <div ref={scrollIntoViewOnMount} className={styles.separator}>
                    <span className={styles.tag}>
                      {chatFrozenRef.current?.unread_message_count}{' '}
                      {messages.newMessages}
                    </span>
                  </div>
                ) : null}
              </Fragment>
            ))}
          {!summary || summary.prev_count > 0 ? (
            <LoadingSpinner className={styles.spinner} />
          ) : null}
        </div>
      </StickyScrollList>
    )
  }
)
