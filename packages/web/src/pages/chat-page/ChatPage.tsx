import { chatSelectors, FeatureFlags, useProxySelector } from '@audius/common'
import { RouteComponentProps } from 'react-router-dom'

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
      header={<ChatHeader currentChatId={chatId} />}
    >
      <div className={styles.layout}>
        <div className={styles.chatList}>
          <ChatList className={styles.chatList} currentChatId={chatId} />
        </div>
        <div className={styles.messages}>
          <ChatMessageList className={styles.messageList} chatId={chatId} />
          <ChatComposer className={styles.messageComposer} chatId={chatId} />
        </div>
      </div>
    </Page>
  )
}
