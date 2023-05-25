import { User, ChatPermissionAction } from '@audius/common'

import { UserNameAndBadges } from 'components/user-name-and-badges/UserNameAndBadges'

import styles from './InboxUnavailableMessage.module.css'

const messages = {
  tip: (user: User) => (
    <>
      You must send <UserNameAndBadges user={user} /> a tip before you can send
      them messages.
    </>
  ),
  unblock: 'You cannot send messages to users you have blocked.',
  default: (user: User) => (
    <>
      You can no longer send messages to <UserNameAndBadges user={user} />
    </>
  ),
  learnMore: 'Learn More.'
}

export const InboxUnavailableMessage = ({
  user,
  action
}: {
  user: User
  action: ChatPermissionAction
}) => {
  switch (action) {
    case ChatPermissionAction.TIP:
      return <div className={styles.root}>{messages.tip(user)}</div>
    case ChatPermissionAction.UNBLOCK:
      return (
        <div className={styles.root}>
          {messages.unblock}{' '}
          <a href='#' target='_blank'>
            {messages.learnMore}
          </a>
        </div>
      )
    default:
      return (
        <div className={styles.root}>
          {messages.default(user)}
          <a href='#' target='_blank'>
            {messages.learnMore}
          </a>
        </div>
      )
  }
}
