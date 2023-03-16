import { useRef, useCallback, useEffect } from 'react'

import type { ReactionTypes } from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { View, Dimensions, Pressable, Animated } from 'react-native'

import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

import { ReactionList } from '../notifications-screen/Reaction'

import { ChatMessageListItem } from './ChatMessageListItem'
import { REACTION_CONTAINER_HEIGHT } from './ChatScreen'

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  reactionsContainer: {
    borderWidth: 1,
    borderRadius: spacing(12),
    borderColor: palette.neutralLight9,
    zIndex: 40,
    width: Dimensions.get('window').width - spacing(10),
    backgroundColor: palette.white,
    marginHorizontal: spacing(5)
  },
  popupContainer: {
    position: 'absolute',
    display: 'flex',
    zIndex: 20,
    overflow: 'hidden'
  },
  dimBackground: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    backgroundColor: 'black'
  },
  outerPressable: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 20
  },
  innerPressable: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 30
  },
  popupChatMessage: {
    position: 'absolute',
    maxWidth: Dimensions.get('window').width - spacing(12),
    zIndex: 40
  },
  emoji: {
    height: spacing(17)
  }
}))

const BACKGROUND_OPACITY = 0.3

export type ReactionInfo = {
  messageTop?: number // Offset from top of highlighted message
  reactionTop?: number // Offset from top of reaction popup
  containerBottom?: number // Bottom border of highlighted content
  hasTail?: boolean // Whether the selected chat has a tail
  isAuthor?: boolean // Whether it was sent from the current user
}

type ReactionPopupProps = {
  reactionInfo: ReactionInfo
  selectedReaction: ReactionTypes
  message: ChatMessage
  closePopup: () => void
  handleReactionSelected: (reaction: ReactionTypes) => void
}

export const ReactionPopup = ({
  reactionInfo,
  selectedReaction,
  message,
  closePopup,
  handleReactionSelected
}: ReactionPopupProps) => {
  const styles = useStyles()
  const backgroundOpacityAnim = useRef(new Animated.Value(0))
  const otherOpacity = useRef(new Animated.Value(0))
  const translationAnim = useRef(new Animated.Value(REACTION_CONTAINER_HEIGHT))

  const beginAnimation = useCallback(() => {
    Animated.spring(backgroundOpacityAnim.current, {
      toValue: BACKGROUND_OPACITY,
      useNativeDriver: true
    }).start()
    Animated.spring(otherOpacity.current, {
      toValue: 1,
      useNativeDriver: true
    }).start()
    Animated.spring(translationAnim.current, {
      toValue: 0,
      useNativeDriver: true
    }).start()
  }, [])

  useEffect(() => {
    beginAnimation()
  }, [beginAnimation])

  return (
    <>
      <Animated.View
        style={[
          styles.dimBackground,
          { opacity: backgroundOpacityAnim.current }
        ]}
      />
      <Pressable style={styles.outerPressable} onPress={closePopup} />
      {/* This View cuts off the message body when it goes beyond the
      bottom boundary of the flatlist view. */}
      <View
        style={[
          styles.popupContainer,
          {
            height: reactionInfo.containerBottom
          }
        ]}
      >
        {/* This 2nd pressable ensures that clicking outside of the
        message and reaction list, but inside of flatlist view,
        closes the popup. */}
        <Pressable style={[styles.innerPressable]} onPress={closePopup} />
        <Animated.View style={{ opacity: otherOpacity.current }}>
          <ChatMessageListItem
            message={message}
            hasTail={reactionInfo.hasTail ?? false}
            ref={() => null}
            shouldShowDate={false}
            style={[
              styles.popupChatMessage,
              {
                top: reactionInfo.messageTop,
                alignSelf: reactionInfo.isAuthor ? 'flex-end' : 'flex-start',
                right: reactionInfo.isAuthor ? spacing(6) : undefined,
                left: !reactionInfo.isAuthor ? spacing(6) : undefined
              }
            ]}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.reactionsContainer,
            {
              top: reactionInfo.reactionTop,
              opacity: otherOpacity.current,
              transform: [
                {
                  translateY: translationAnim.current
                }
              ]
            }
          ]}
        >
          <ReactionList
            selectedReaction={selectedReaction}
            onChange={(reaction) => {
              if (reaction) {
                handleReactionSelected(reaction)
              }
            }}
            isVisible={true}
            scale={1.6}
            style={{
              emoji: styles.emoji
            }}
          />
        </Animated.View>
      </View>
    </>
  )
}
