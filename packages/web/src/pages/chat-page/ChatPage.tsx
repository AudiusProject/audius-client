import { chatSelectors, FeatureFlags, useProxySelector } from '@audius/common'
import { RouteComponentProps } from 'react-router-dom'
import useMeasure from 'react-use-measure'

import Page from 'components/page/Page'
import { useFlag } from 'hooks/useRemoteConfig'

import styles from './ChatPage.module.css'
import { ChatComposer } from './components/ChatComposer'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatMessageList } from './components/ChatMessageList'

const { getOtherChatUsers } = chatSelectors

const messages = {
  messages: 'Messages'
}

export const ChatPage = ({ match }: RouteComponentProps<{ id?: string }>) => {
  const chatId = match.params.id
  const { isEnabled: isChatEnabled } = useFlag(FeatureFlags.CHAT_ENABLED)
  const users = useProxySelector(
    (state) => getOtherChatUsers(state, chatId),
    [chatId]
  )

  // Get the height of the header so we can slide the messages list underneath it for the blur effect
  const [headerRef, bounds] = useMeasure({
    polyfill: ResizeObserver,
    offsetSize: true
  })

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
      useSearch={false}
      header={<ChatHeader ref={headerRef} currentChatId={chatId} />}
    >
      <div className={styles.layout}>
        <div className={styles.chatList}>
          <ChatList className={styles.chatList} currentChatId={chatId} />
        </div>
        <div className={styles.chatArea}>
          <div
            className={styles.messages}
            style={{
              marginTop: `${-bounds.height}px`,
              paddingTop: `${bounds.height}px`
            }}
          >
            <ChatMessageList className={styles.messageList} chatId={chatId} />
          </div>
          <ChatComposer chatId={chatId} />
        </div>
      </div>
    </Page>
  )
}
