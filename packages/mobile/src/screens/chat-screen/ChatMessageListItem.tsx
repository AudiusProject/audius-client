import { useState, forwardRef } from 'react'

import type { ReactionTypes } from '@audius/common'
import {
  accountSelectors,
  decodeHashId,
  formatMessageDate
} from '@audius/common'
import type { ChatMessage, ChatMessageReaction } from '@audius/sdk'
import type { ViewStyle, StyleProp } from 'react-native'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import ChatTail from 'app/assets/images/ChatTail.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemePalette } from 'app/utils/theme'

import { reactionMap } from '../notifications-screen/Reaction'

const { getUserId } = accountSelectors

const REACTION_OFFSET_X = 13
const REACTION_OFFSET_Y = 14

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
    height: spacing(8),
    width: spacing(8),
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  }
}))

const ChatReaction = ({ reaction, reactionPosition, isAuthor }) => {
  const styles = useStyles()

  if (!reaction || !reaction.reaction || !(reaction.reaction in reactionMap)) {
    return null
  }
  const Reaction = reactionMap[reaction.reaction as ReactionTypes]
  const reactionPositionStyle = [
    { top: reactionPosition?.y },
    isAuthor ? { right: reactionPosition?.x } : { left: reactionPosition?.x }
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

const formatChatReactions = (
  reactions: ChatMessageReaction[],
  isAuthor: boolean,
  reactionPosition: { x: number; y: number }
) => {
  // When there are multiple reactions, shift the earlier reactions closer
  // towards the inside of of the message body.
  if (reactions.length > 1) {
    return reactions.map((reaction, index) => {
      return (
        <ChatReaction
          key={index}
          reaction={reaction}
          reactionPosition={{
            ...reactionPosition,
            x: reactionPosition.x - (reactions.length - 1 - index) * spacing(4)
          }}
          isAuthor={isAuthor}
        />
      )
    })
  } else {
    return (
      <ChatReaction
        reaction={reactions[0]}
        reactionPosition={reactionPosition}
        isAuthor={isAuthor}
      />
    )
  }
}

export const ChatMessageListItem = forwardRef<View, ChatMessageListItemProps>(
  (props: ChatMessageListItemProps, refProp) => {
    const {
      message,
      hasTail,
      shouldShowReaction = true,
      shouldShowDate = true,
      style: styleProp
    } = props
    const styles = useStyles()
    const palette = useThemePalette()

    const userId = useSelector(getUserId)
    const senderUserId = decodeHashId(message.sender_user_id)
    const isAuthor = senderUserId === userId
    // Offset of reactions against message body parent, using absolute position.
    const [reactionPosition, setReactionPosition] = useState<{
      x: number
      y: number
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
            ref={refProp}
            style={[styles.bubble, isAuthor && styles.isAuthor]}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout
              setReactionPosition({
                x: width - REACTION_OFFSET_X,
                y: height - REACTION_OFFSET_Y
              })
            }}
          >
            <Text style={[styles.message, isAuthor && styles.messageIsAuthor]}>
              {message.message}
            </Text>
          </View>
          {shouldShowReaction &&
          message.reactions?.length > 0 &&
          reactionPosition
            ? formatChatReactions(message.reactions, isAuthor, reactionPosition)
            : null}
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
)
