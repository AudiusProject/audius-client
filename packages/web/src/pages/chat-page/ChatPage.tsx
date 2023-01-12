import { chatSelectors, FeatureFlags } from '@audius/common'
import { RouteComponentProps } from 'react-router-dom'

import Page from 'components/page/Page'
import { useFlag } from 'hooks/useRemoteConfig'
import { useSelector } from 'utils/reducer'

import styles from './ChatPage.module.css'
import { ChatComposer } from './components/ChatComposer'
import { ChatHeader } from './components/ChatHeader'
import { ChatList } from './components/ChatList'
import { ChatMessageList } from './components/ChatMessageList'
import { useOtherChatUser } from './hooks'

const messages = {
  messages: 'Messages'
}

export const ChatPage = ({ match }: RouteComponentProps<{ id?: string }>) => {
  const chatId = match.params.id
  const { isEnabled: isChatEnabled } = useFlag(FeatureFlags.CHAT_ENABLED)
  const chat = useSelector((state) => chatSelectors.getChat(state, chatId))
  const user = useOtherChatUser(chat)
  if (!isChatEnabled) {
    return null
  }
  return (
    <Page
      title={`${user ? user.name + ' •' : ''} ${messages.messages}`}
      containerClassName={styles.page}
      contentClassName={styles.pageContent}
      useSearch={false}
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
