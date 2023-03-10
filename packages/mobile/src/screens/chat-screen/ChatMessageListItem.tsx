import { useState } from 'react'

import type { ReactionTypes } from '@audius/common'
import {
  accountSelectors,
  decodeHashId,
  formatMessageDate
} from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import type { ViewStyle, StyleProp } from 'react-native'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import ChatTail from 'app/assets/images/ChatTail.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { useThemePalette } from 'app/utils/theme'

import { reactionMap } from '../notifications-screen/Reaction'

const { getUserId } = accountSelectors

const REACTION_OFFSET_WIDTH = 15
const REACTION_OFFSET_HEIGHT = 15

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
  reaction: {
    height: spacing(10),
    width: spacing(10),
    position: 'absolute'
  }
}))

const ChatReaction = ({ reaction, reactionPosition, isAuthor }) => {
  const styles = useStyles()

  if (!reaction || !reaction.reaction || !(reaction.reaction in reactionMap)) {
    return null
  }
  const Reaction = reactionMap[reaction.reaction as ReactionTypes]
  const reactionPositionStyle = [
    { top: reactionPosition?.height },
    isAuthor
      ? { right: reactionPosition?.width }
      : { left: reactionPosition?.width }
  ]
  return (
    <Reaction
      style={[styles.reaction, ...reactionPositionStyle]}
      key={reaction.user_id}
      isVisible
    />
  )
}

type ChatMessageListItemProps = {
  message: ChatMessage
  hasTail: boolean
  shouldShowReaction?: boolean
  shouldShowDate?: boolean
  style?: StyleProp<ViewStyle>
}

export const ChatMessageListItem = ({
  message,
  hasTail,
  shouldShowReaction = true,
  shouldShowDate = true,
  style: styleProp
}: ChatMessageListItemProps) => {
  const styles = useStyles()
  const palette = useThemePalette()

  const userId = useSelector(getUserId)
  const senderUserId = decodeHashId(message.sender_user_id)
  const isAuthor = senderUserId === userId
  const [reactionPosition, setReactionPosition] = useState<{
    width: number
    height: number
  }>()

  return (
    <>
      <View
        style={[
          isAuthor ? styles.rootIsAuthor : styles.rootOtherUser,
          styleProp
        ]}
      >
        <View
          style={[styles.bubble, isAuthor && styles.isAuthor]}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout
            setReactionPosition({
              width: width - REACTION_OFFSET_WIDTH,
              height: height - REACTION_OFFSET_HEIGHT
            })
          }}
        >
          <Text style={[styles.message, isAuthor && styles.messageIsAuthor]}>
            {message.message}
          </Text>
        </View>
        {shouldShowReaction && message.reactions?.length > 0 ? (
          <ChatReaction
            reaction={message.reactions[message.reactions.length - 1]}
            reactionPosition={reactionPosition}
            isAuthor={isAuthor}
          />
        ) : null}
        {hasTail ? (
          <>
            <View
              style={[
                styles.tail,
                isAuthor ? styles.tailIsAuthor : styles.tailOtherUser,
                !shouldShowDate && { bottom: 0 }
              ]}
            >
              <ChatTail fill={isAuthor ? palette.secondary : palette.white} />
            </View>
            {shouldShowDate ? (
              <View style={styles.dateContainer}>
                <Text style={styles.date}>
                  {formatMessageDate(message.created_at)}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </>
  )
}
