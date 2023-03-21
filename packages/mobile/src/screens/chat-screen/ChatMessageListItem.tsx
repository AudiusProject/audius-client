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
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'

import ChatTail from 'app/assets/images/ChatTail.svg'
import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemePalette } from 'app/utils/theme'

import { reactionMap } from '../notifications-screen/Reaction'

const { getUserId } = accountSelectors

const REACTION_OFFSET_X = 13
const REACTION_OFFSET_Y = 16
const REACTION_SPACE_BETWEEN = spacing(4)

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
    shadowColor: 'black',
    shadowOffset: { width: -2, height: 3 },
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
  tailShadow: {
    position: 'absolute',
    bottom: 0,
    left: spacing(3),
    backgroundColor: palette.background,
    height: 0.2,
    width: spacing(3),
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2
  },
  reactionMarginBottom: {
    marginBottom: spacing(2)
  },
  reaction: {
    height: spacing(8),
    width: spacing(8),
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  reactionContainer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: -REACTION_SPACE_BETWEEN
  }
}))

type ChatReactionProps = {
  reaction: ChatMessageReaction
  reactionPosition: { x: number; y: number }
  isAuthor?: boolean
}

const ChatReaction = ({
  reaction,
  reactionPosition,
  isAuthor
}: ChatReactionProps) => {
  const styles = useStyles()

  if (!reaction || !reaction.reaction || !(reaction.reaction in reactionMap)) {
    return null
  }
  const Reaction = reactionMap[reaction.reaction as ReactionTypes]
  return <Reaction style={styles.reaction} key={reaction.user_id} isVisible />
}

type ChatMessageListItemProps = {
  message: ChatMessage
  hasTail: boolean
  shouldShowReaction?: boolean
  shouldShowDate?: boolean
  style?: StyleProp<ViewStyle>
  onLongPress?: () => void
}

export const ChatMessageListItem = forwardRef<View, ChatMessageListItemProps>(
  (props: ChatMessageListItemProps, refProp) => {
    const {
      message,
      hasTail,
      shouldShowReaction = true,
      shouldShowDate = true,
      style: styleProp,
      onLongPress
    } = props
    const styles = useStyles()
    const palette = useThemePalette()

    const userId = useSelector(getUserId)
    const senderUserId = decodeHashId(message.sender_user_id)
    const isAuthor = senderUserId === userId
    // Offset of reactions in relation to message body parent.
    const [reactionPosition, setReactionPosition] = useState<{
      x: number
      y: number
    }>({ x: 0, y: 0 })

    const reactionPositionStyle = [
      { top: reactionPosition?.y },
      isAuthor
        ? {
            right:
              reactionPosition?.x +
              (message.reactions.length - 1) * REACTION_SPACE_BETWEEN
          }
        : {
            left:
              reactionPosition?.x -
              (message.reactions.length - 1) * REACTION_SPACE_BETWEEN
          }
    ]

    return (
      <>
        <View
          style={[
            isAuthor ? styles.rootIsAuthor : styles.rootOtherUser,
            styleProp
          ]}
        >
          <TouchableWithoutFeedback onPress={onLongPress}>
            <View
              ref={refProp}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout
                setReactionPosition({
                  x: width - REACTION_OFFSET_X,
                  y: height - REACTION_OFFSET_Y
                })
              }}
            >
              {/* This View is for measuring y offset and height to calculate
            position of reactions popup. */}
              <View
                ref={refProp}
                style={[styles.bubble, isAuthor && styles.isAuthor]}
              >
                <Text
                  style={[styles.message, isAuthor && styles.messageIsAuthor]}
                >
                  {message.message}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
          {hasTail ? (
            <>
              <View
                style={[
                  styles.tail,
                  isAuthor ? styles.tailIsAuthor : styles.tailOtherUser,
                  !shouldShowDate && { bottom: 0 }
                ]}
              >
                <View style={styles.tailShadow} />
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
          {message.reactions?.length > 0 ? (
            <>
              {shouldShowReaction ? (
                <View
                  style={[styles.reactionContainer, ...reactionPositionStyle]}
                >
                  {message.reactions.map((reaction, index) => {
                    return (
                      <ChatReaction
                        key={index}
                        reaction={reaction}
                        reactionPosition={reactionPosition}
                      />
                    )
                  })}
                </View>
              ) : null}
              {/* Add an 8px margin between messages when there are reactions. */}
              {!hasTail ? <View style={styles.reactionMarginBottom} /> : null}
            </>
          ) : null}
        </View>
      </>
    )
  }
)
