import {
  ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useState
} from 'react'

import { chatSelectors, chatActions, Status } from '@audius/common'
import cn from 'classnames'
import InfiniteScroll from 'react-infinite-scroller'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'

import styles from './ChatList.module.css'
import { ChatListItem } from './ChatListItem'
import { SkeletonChatListItem } from './SkeletonChatListItem'

const { getChats, getChatsStatus, getChatsSummary } = chatSelectors
const { fetchMoreChats } = chatActions

const messages = {
  nothingHere: 'Nothing Here Yet',
  start: 'Start a Conversation!'
}

type ChatListProps = {
  currentChatId?: string
  onChatClicked: (chatId: string) => void
} & ComponentPropsWithoutRef<'div'>

export const ChatList = (props: ChatListProps) => {
  const { currentChatId, onChatClicked } = props
  const dispatch = useDispatch()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const chats = useSelector(getChats)
  const status = useSelector(getChatsStatus)
  const summary = useSelector(getChatsSummary)

  const handleLoadMoreChats = useCallback(() => {
    dispatch(fetchMoreChats())
  }, [dispatch])

  useEffect(() => {
    if (status === Status.SUCCESS) {
      setHasLoadedOnce(true)
    }
  }, [status, setHasLoadedOnce])

  return (
    <div className={cn(styles.root, props.className)}>
      <InfiniteScroll
        pageStart={0}
        initialLoad={true}
        loadMore={handleLoadMoreChats}
        hasMore={
          status === Status.IDLE ||
          (summary?.prev_count !== undefined && summary?.prev_count > 0)
        }
        useWindow={false}
        loader={
          <LoadingSpinner key={'loading-spinner'} className={styles.spinner} />
        }
      >
        {chats?.length > 0 ? (
          chats.map((chat) => (
            <ChatListItem
              key={chat.chat_id}
              currentChatId={currentChatId}
              chat={chat}
              onChatClicked={onChatClicked}
            />
          ))
        ) : hasLoadedOnce ? (
          <div className={styles.empty}>
            <div className={styles.header}>{messages.nothingHere}</div>
            <div className={styles.subheader}>{messages.start}</div>
          </div>
        ) : (
          <>
            <SkeletonChatListItem />
            <SkeletonChatListItem style={{ opacity: 0.5 }} />
            <SkeletonChatListItem style={{ opacity: 0.25 }} />
          </>
        )}
      </InfiniteScroll>
    </div>
  )
}
