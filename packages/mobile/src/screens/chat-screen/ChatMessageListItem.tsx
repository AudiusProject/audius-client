import {
  accountSelectors,
  decodeHashId,
  formatMessageDate
} from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import ChatTail from 'app/assets/images/ChatTail.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { useThemePalette } from 'app/utils/theme'

const { getUserId } = accountSelectors

const messages = {
  newMessage: 'New Message'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  rootOtherUser: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  rootIsAuthor: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  bubble: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    marginTop: spacing(2),
    backgroundColor: palette.white,
    borderRadius: spacing(3),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  isAuthor: {
    backgroundColor: palette.secondary
  },
  message: {
    fontSize: typography.fontSize.medium,
    lineHeight: spacing(6)
  },
  messageIsAuthor: {
    color: palette.white
  },
  dateContainer: {
    marginTop: spacing(2),
    marginBottom: spacing(6)
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: palette.neutralLight2
  },
  unreadTagContainer: {
    marginVertical: spacing(6),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  unreadSeparator: {
    height: 1,
    backgroundColor: palette.neutralLight5,
    flexGrow: 1
  },
  unreadTag: {
    color: palette.white,
    fontSize: typography.fontSize.xxs,
    fontFamily: typography.fontByWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: palette.neutralLight5,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: spacing(0.5)
  },
  tail: {
    display: 'flex',
    position: 'absolute',
    zIndex: -1,
    bottom: 47
  },
  tailIsAuthor: {
    right: -spacing(3)
  },
  tailOtherUser: {
    left: -spacing(3),
    transform: [{ scaleX: -1 }]
  }
}))

const pluralize = (message: string, shouldPluralize: boolean) =>
  message + (shouldPluralize ? 's' : '')

type ChatMessageListItemProps = {
  message: ChatMessage
  hasTail: boolean
  isEarliestUnread: boolean
  unreadCount: number
}

export const ChatMessageListItem = ({
  message,
  hasTail,
  isEarliestUnread,
  unreadCount
}: ChatMessageListItemProps) => {
  const styles = useStyles()
  const palette = useThemePalette()

  const userId = useSelector(getUserId)
  const senderUserId = decodeHashId(message.sender_user_id)
  const isAuthor = senderUserId === userId

  return (
    <>
      <View style={isAuthor ? styles.rootIsAuthor : styles.rootOtherUser}>
        <View style={[styles.bubble, isAuthor && styles.isAuthor]}>
          <Text style={[styles.message, isAuthor && styles.messageIsAuthor]}>
            {message.message}
          </Text>
        </View>
        {hasTail ? (
          <>
            <View
              style={[
                styles.tail,
                isAuthor ? styles.tailIsAuthor : styles.tailOtherUser
              ]}
            >
              <ChatTail fill={isAuthor ? palette.secondary : palette.white} />
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>
                {formatMessageDate(message.created_at)}
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {isEarliestUnread ? (
        <View style={styles.unreadTagContainer} key='unreadTag'>
          <View style={styles.unreadSeparator} />
          <Text style={styles.unreadTag}>
            {unreadCount} {pluralize(messages.newMessage, unreadCount > 1)}
          </Text>
          <View style={styles.unreadSeparator} />
        </View>
      ) : null}
    </>
  )
}
