import { chatSelectors } from '@audius/common'
import { IconSettings } from '@audius/stems'

import { useSelector } from 'utils/reducer'

import { useOtherChatUser } from '../hooks'

import styles from './ChatHeader.module.css'
import { ChatUser } from './ChatUser'

const messages = {
  header: 'Messages'
}

export const ChatHeader = ({ currentChatId }: { currentChatId?: string }) => {
  const { data: chats } = useSelector(chatSelectors.getChats)
  const chat = chats.find((chat) => chat.chat_id === currentChatId)
  const user = useOtherChatUser(chat)
  if (!user) {
    return null
  }
  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <h1 className={styles.header}>{messages.header}</h1>
        <div className={styles.options}>
          <IconSettings />
          {/* <IconCompose /> */}
        </div>
      </div>
      <div className={styles.right}>
        <ChatUser user={user} />
      </div>
    </div>
  )
}
