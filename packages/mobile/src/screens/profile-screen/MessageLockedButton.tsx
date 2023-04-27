import { useCallback } from 'react'

import type { User, ID } from '@audius/common'
import { chatSelectors } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'

import IconMessageLocked from 'app/assets/images/iconMessageLocked.svg'
import { Button } from 'app/components/core'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

const { getUserChatPermissions, getBlockers, getBlockees } = chatSelectors

const messages = {
  inboxUnavailable: 'Inbox Unavailable',
  blocker: 'You can no longer send messages to this person.',
  blockee: 'You cannot send messages to users you have blocked.',
  followGated1: 'You must follow',
  followGated2:
    'or change your inbox settings before you can send them messages.',
  tipGated1: 'You must send',
  tipGated2: 'a tip before you can send them messages.',
  ownSettings:
    'Your current Inbox Settings are preventing you from sending or receiving messages.',
  learnMore: 'Learn More'
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    paddingHorizontal: 0,
    height: spacing(8),
    width: spacing(8),
    marginRight: spacing(2),
    borderColor: palette.neutralLight4
  }
}))

type MessageLockedButtonProps = {
  profile: Pick<User, 'user_id'>
}

export const MessageLockedButton = (props: MessageLockedButtonProps) => {
  const styles = useStyles()
  const { profile } = props
  const { user_id: userId } = profile
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    dispatch(
      setVisibility({
        drawer: 'InboxUnavailable',
        visible: true,
        data: { userId }
      })
    )
  }, [dispatch, userId])

  return (
    <Button
      style={styles.root}
      noText
      title={messages.inboxUnavailable}
      icon={IconMessageLocked}
      variant={'common'}
      size='small'
      onPress={handlePress}
    />
  )
}
