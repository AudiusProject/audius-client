import {
  accountSelectors,
  decodeHashId,
  formatMessageDate
} from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { View, Pressable } from 'react-native'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from 'react-native-popup-menu'
import { useSelector } from 'react-redux'

import ChatTail from 'app/assets/images/ChatTail.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { useThemePalette } from 'app/utils/theme'

const { getUserId } = accountSelectors

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

type ChatMessageListItemProps = {
  message: ChatMessage
  hasTail: boolean
  unreadCount: number
}

export const ChatMessageListItem = ({
  message,
  hasTail,
  unreadCount
}: ChatMessageListItemProps) => {
  const styles = useStyles()
  const palette = useThemePalette()

  const userId = useSelector(getUserId)
  const senderUserId = decodeHashId(message.sender_user_id)
  const isAuthor = senderUserId === userId
  // const [isReactionPopupVisible, setReactionPopupVisible] = useState(false)

  // handleLongPress = useCallback(
  //   () => setReactionPopupVisible((isVisible) => !isVisible),
  //   [setReactionPopupVisible]
  // )

  return (
    <>
      <View style={isAuthor ? styles.rootIsAuthor : styles.rootOtherUser}>
        <Menu style={[styles.bubble, isAuthor && styles.isAuthor]}>
          <MenuTrigger text='Select action' />
          <MenuOptions>
            <MenuOption onSelect={() => alert(`Save`)} text='Save' />
            <MenuOption onSelect={() => alert(`Delete`)}>
              <Text style={{ color: 'red' }}>Delete</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => alert(`Not called`)}
              disabled={true}
              text='Disabled'
            />
          </MenuOptions>
          <Text style={[styles.message, isAuthor && styles.messageIsAuthor]}>
            {message.message}
          </Text>
        </Menu>
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
    </>
  )
}
