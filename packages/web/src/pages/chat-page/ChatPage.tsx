import { FeatureFlags } from '@audius/common'
import { RouteComponentProps } from 'react-router-dom'

import Page from 'components/page/Page'
import { useFlag } from 'hooks/useRemoteConfig'

import styles from './ChatPage.module.css'
import { ChatComposer } from './components/ChatComposer'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatMessageList } from './components/ChatMessageList'

export const ChatPage = ({ match }: RouteComponentProps<{ id?: string }>) => {
  const chatId = match.params.id
  const { isEnabled: isChatEnabled } = useFlag(FeatureFlags.CHAT_ENABLED)
  if (!isChatEnabled) {
    return null
  }
  return (
    <Page
      containerClassName={styles.page}
      contentClassName={styles.pageContent}
      useSearch={false}
      header={<ChatHeader currentChatId={chatId} />}
    >
      <div className={styles.layout}>
        <ChatList className={styles.chatList} currentChatId={chatId} />
        <div className={styles.messages}>
          <ChatMessageList className={styles.messageList} chatId={chatId} />
          <ChatComposer className={styles.messageComposer} chatId={chatId} />
        </div>
      </div>
    </Page>
  )
}
