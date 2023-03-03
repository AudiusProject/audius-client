import { useCallback, useRef, useState } from 'react'

import type { Nullable, ReactionTypes } from '@audius/common'
import {
  accountSelectors,
  cacheUsersSelectors,
  decodeHashId,
  encodeHashId,
  formatMessageDate,
  useProxySelector,
  chatActions
} from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { View, Pressable, TouchableHighlight } from 'react-native'
import type { Menu } from 'react-native-popup-menu'
import { MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu'
import { useDispatch, useSelector } from 'react-redux'

import ChatTail from 'app/assets/images/ChatTail.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { useThemePalette } from 'app/utils/theme'

import { ReactionList, reactionMap } from '../notifications-screen/Reaction'

const { getUserId } = accountSelectors
const { setMessageReaction } = chatActions

const REACTION_OFFSET_WIDTH = 15
const REACTION_OFFSET_HEIGHT = 15

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  rootOtherUser: {
    display: 'flex',
    alignItems: 'flex-start',
    zIndex: 1
  },
  rootIsAuthor: {
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 1
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
    shadowRadius: 5,
    zIndex: 2
  },
  bubbleContainer: {
    zIndex: 2
  },
  isAuthor: {
    backgroundColor: palette.secondary
  },
  message: {
    fontSize: typography.fontSize.medium,
    lineHeight: spacing(6),
    color: palette.neutral
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
    bottom: 47
  },
  tailIsAuthor: {
    right: -spacing(3)
  },
  tailOtherUser: {
    left: -spacing(3),
    transform: [{ scaleX: -1 }]
  },
  test: {
    width: '100%'
  },
  menu: {
    backgroundColor: palette.accentRed
  },
  reactionsContainer: {
    display: 'flex',
    // flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    // marginTop: -30,
    // flexGrow: 1,
    // right: 1000,
    backgroundColor: palette.white,
    borderColor: palette.accentRed,
    borderWidth: 2,
    borderRadius: spacing(3),
    bottom: 100,
    zIndex: 10,
    width: '100%',
    marginHorizontal: spacing(4)
  },
  reactionsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch'
    // width: '100%',
    // backgroundColor: palette.accentBlue
  },
  reaction: {
    height: spacing(10),
    width: spacing(10),
    position: 'absolute',
    zIndex: 1
  }
}))

type ChatMessageListItemProps = {
  message: ChatMessage
  chatId: string
  hasTail: boolean
  unreadCount: number
}

export const ChatMessageListItem = ({
  message,
  chatId,
  hasTail,
  unreadCount
}: ChatMessageListItemProps) => {
  const styles = useStyles()
  const palette = useThemePalette()
  const dispatch = useDispatch()

  const userId = useSelector(getUserId)
  const senderUserId = decodeHashId(message.sender_user_id)
  const isAuthor = senderUserId === userId
  const menuRef = useRef<Menu>()
  const [reactionPosition, setReactionPosition] = useState<{
    width: number
    height: number
  }>()
  const [messageHeight, setMessageHeight] = useState<number>()
  const [shouldShowReactionPopup, setShouldShowReactionPopup] =
    useState<boolean>(false)
  const selectedReactionValue = message.reactions?.find(
    (r) => r.user_id === encodeHashId(userId)
  )?.reaction
  let selectedReaction
  if (selectedReactionValue) {
    selectedReaction = reactionMap[selectedReactionValue]
  }

  const handleLongPress = useCallback(
    () => setShouldShowReactionPopup((isVisible) => !isVisible),
    []
  )
  const handleCloseReactionPopup = useCallback(
    () => setShouldShowReactionPopup(false),
    []
  )
  const handleReactionSelected = useCallback(
    (reaction: ReactionTypes) => {
      console.log('REED got reaction: ', reaction)
      if (userId) {
        dispatch(
          setMessageReaction({
            userId,
            chatId,
            messageId: message.message_id,
            reaction:
              message.reactions?.find((r) => r.user_id === encodeHashId(userId))
                ?.reaction === reaction
                ? null
                : reaction
          })
        )
      }
      handleCloseReactionPopup()
    },
    [dispatch, handleCloseReactionPopup, userId, chatId, message]
  )

  return (
    <>
      <View style={isAuthor ? styles.rootIsAuthor : styles.rootOtherUser}>
        <TouchableHighlight
          onLongPress={handleLongPress}
          style={styles.bubbleContainer}
        >
          <View
            style={[styles.bubble, isAuthor && styles.isAuthor]}
            onLayout={(e) => {
              console.log(e.nativeEvent.layout)
              const { width, height } = e.nativeEvent.layout
              setReactionPosition({
                width: width - REACTION_OFFSET_WIDTH,
                height: height - REACTION_OFFSET_HEIGHT
              })
              setMessageHeight(height)
            }}
          >
            <Text style={[styles.message, isAuthor && styles.messageIsAuthor]}>
              {message.message}
            </Text>
          </View>
        </TouchableHighlight>
        {shouldShowReactionPopup ? (
          <View style={[styles.reactionsContainer, { bottom: messageHeight }]}>
            <ReactionList
              selectedReaction={selectedReaction ?? null}
              onChange={handleReactionSelected}
              isVisible
            />
          </View>
        ) : null}
        {message.reactions?.length > 0 && reactionPosition
          ? message.reactions.map((reaction) => {
              if (!reaction.reaction || !(reaction.reaction in reactionMap)) {
                return null
              }
              const Reaction = reactionMap[reaction.reaction as ReactionTypes]
              return (
                <Reaction
                  style={[
                    styles.reaction,
                    { top: reactionPosition?.height },
                    isAuthor
                      ? { right: reactionPosition?.width }
                      : { left: reactionPosition?.width }
                  ]}
                  key={reaction.user_id}
                  isVisible
                />
              )
            })
          : null}
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
