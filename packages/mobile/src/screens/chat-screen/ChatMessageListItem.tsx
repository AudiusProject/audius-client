import { useEffect } from 'react'

import {
  accountSelectors,
  decodeHashId,
  formatMessageDate
} from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { useSelector } from 'react-redux'

// import { ReactComponent as ChatTail } from 'app/assets/images/ChatTail.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { useThemePalette } from 'app/utils/theme'

const { getUserId } = accountSelectors

const messages = {
  newMessage: 'New Message',
  s: 's'
}

const ChatTail = ({ fill }) => (
  <Svg
    width='25'
    height='12'
    viewBox='0 0 25 12'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <Path
      d='M11 0V12H22.3944C24.3733 12 25.1503 9.43355 23.5038 8.3359L11 0Z'
      fill={fill}
    />
    <Rect
      width='11'
      height='12'
      transform='matrix(-1 0 0 1 11 0)'
      fill={fill}
    />
  </Svg>
)

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
    padding: spacing(4),
    marginTop: spacing(2),
    backgroundColor: palette.white,
    borderRadius: spacing(3),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    fontSize: typography.fontSize.medium
  },
  isAuthor: {
    backgroundColor: palette.secondary
  },
  textIsAuthor: {
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
  // tailIsAuthor: {
  //   display: 'flex',
  //   position: 'absolute',
  //   right: -7,
  //   zIndex: -1,
  //   bottom: 47,
  //   width: 18,
  //   height: 12
  // },
  // tailOtherUser: {
  //   display: 'flex',
  //   position: 'absolute',
  //   left: -7,
  //   zIndex: -1,
  //   bottom: 47,
  //   width: 18,
  //   height: 12,
  //   transform: [{ scaleX: -1 }]
  // }
  tailIsAuthor: {
    display: 'flex',
    position: 'relative',
    marginRight: -14,
    marginTop: -12
  },
  tailOtherUser: {
    display: 'flex',
    position: 'relative',
    marginLeft: -14,
    marginTop: -12,
    transform: [{ scaleX: -1 }]
  }
}))

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
      <View style={[isAuthor ? styles.rootIsAuthor : styles.rootOtherUser]}>
        <View style={[styles.bubble, isAuthor && styles.isAuthor]}>
          <Text style={isAuthor && styles.textIsAuthor}>{message.message}</Text>
        </View>
        {hasTail && (
          <>
            <View style={isAuthor ? styles.tailIsAuthor : styles.tailOtherUser}>
              <ChatTail fill={isAuthor ? palette.secondary : palette.white} />
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>
                {formatMessageDate(message.created_at)}
              </Text>
            </View>
          </>
        )}
      </View>

      {isEarliestUnread && (
        <View style={styles.unreadTagContainer} key='unreadTag'>
          <View style={styles.unreadSeparator} />
          <Text style={styles.unreadTag}>
            {unreadCount} {messages.newMessage}
            {unreadCount > 1 && messages.s}
          </Text>
          <View style={styles.unreadSeparator} />
        </View>
      )}
    </>
  )
}
