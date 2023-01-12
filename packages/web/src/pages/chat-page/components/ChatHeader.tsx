import { chatSelectors } from '@audius/common'
import { IconSettings } from '@audius/stems'

import { useSelector } from 'utils/reducer'

import { useOtherChatUser } from '../hooks'

import styles from './ChatHeader.module.css'
import { ChatUser } from './ChatUser'

const messages = {
  header: 'Messages'
}

const { getChat } = chatSelectors

export const ChatHeader = ({ currentChatId }: { currentChatId?: string }) => {
  const chat = useSelector((state) => getChat(state, currentChatId))
  const user = useOtherChatUser(chat)
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
        {user ? <ChatUser user={user} /> : null}
      </div>
    </div>
  )
}
