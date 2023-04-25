import { useRef, useCallback, useEffect } from 'react'

import type {
  ChatMessageWithExtras,
  Nullable,
  ReactionTypes
} from '@audius/common'
import { chatActions, encodeHashId, accountSelectors } from '@audius/common'
import { View, Dimensions, Pressable, Animated } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

import { ReactionList } from '../notifications-screen/Reaction'

import { ChatMessageListItem } from './ChatMessageListItem'
import { REACTION_CONTAINER_HEIGHT } from './ChatScreen'

const { getUserId } = accountSelectors
const { setMessageReaction } = chatActions

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
const MOUNT_ANIMATION_DURATION_MS = 100
const UNMOUNT_ANIMATION_DURATION_MS = 100

type ReactionPopupProps = {
  chatId: string
  messageTop: number
  containerBottom: number
  isAuthor: boolean
  message: ChatMessageWithExtras
  shouldShowPopup: boolean
  onClose: () => void
}

export const ReactionPopup = ({
  chatId,
  messageTop,
  containerBottom,
  isAuthor,
  message,
  shouldShowPopup,
  onClose
}: ReactionPopupProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const backgroundOpacityAnim = useRef(new Animated.Value(0))
  const otherOpacity = useRef(new Animated.Value(0))
  const translationAnim = useRef(new Animated.Value(REACTION_CONTAINER_HEIGHT))
  const userId = useSelector(getUserId)
  const userIdEncoded = encodeHashId(userId)
  const selectedReaction = message.reactions?.find(
    (r) => r.user_id === userIdEncoded
  )?.reaction

  const beginMountAnimation = useCallback(() => {
    Animated.timing(backgroundOpacityAnim.current, {
      toValue: BACKGROUND_OPACITY,
      useNativeDriver: true,
      duration: MOUNT_ANIMATION_DURATION_MS
    }).start()
    Animated.timing(otherOpacity.current, {
      toValue: 1,
      useNativeDriver: true,
      duration: MOUNT_ANIMATION_DURATION_MS
    }).start()
    Animated.spring(translationAnim.current, {
      toValue: 0,
      useNativeDriver: true
    }).start()
  }, [])

  const beginUnmountAnimation = useCallback(() => {
    Animated.timing(backgroundOpacityAnim.current, {
      toValue: 0,
      useNativeDriver: true,
      duration: UNMOUNT_ANIMATION_DURATION_MS
    }).start()
    Animated.timing(otherOpacity.current, {
      toValue: 0,
      useNativeDriver: true,
      duration: UNMOUNT_ANIMATION_DURATION_MS
    }).start(onClose)
    Animated.spring(translationAnim.current, {
      toValue: REACTION_CONTAINER_HEIGHT,
      useNativeDriver: true
    }).start()
  }, [onClose])

  useEffect(() => {
    beginMountAnimation()
  }, [beginMountAnimation])

  const handleClosePopup = useCallback(() => {
    beginUnmountAnimation()
  }, [beginUnmountAnimation])

  const handleReactionSelected = useCallback(
    (message: Nullable<ChatMessageWithExtras>, reaction: ReactionTypes) => {
      if (userId && message) {
        dispatch(
          setMessageReaction({
            userId,
            chatId,
            messageId: message.message_id,
            reaction:
              message.reactions?.find((r) => r.user_id === userIdEncoded)
                ?.reaction === reaction
                ? null
                : reaction
          })
        )
      }
      handleClosePopup()
    },
    [userId, handleClosePopup, dispatch, chatId, userIdEncoded]
  )

  return shouldShowPopup ? (
    <>
      <Animated.View
        style={[
          styles.dimBackground,
          { opacity: backgroundOpacityAnim.current }
        ]}
      />
      <Pressable style={styles.outerPressable} onPress={handleClosePopup} />
      {/* This View cuts off the message body when it goes beyond the
      bottom boundary of the flatlist view. */}
      <View
        style={[
          styles.popupContainer,
          {
            height: containerBottom
          }
        ]}
      >
        {/* This 2nd pressable ensures that clicking outside of the
        message and reaction list, but inside of flatlist view,
        closes the popup. */}
        <Pressable style={[styles.innerPressable]} onPress={handleClosePopup} />
        <Animated.View style={{ opacity: otherOpacity.current }}>
          <ChatMessageListItem
            chatId={chatId}
            message={message}
            isPopup={true}
            style={[
              styles.popupChatMessage,
              {
                top: messageTop,
                alignSelf: isAuthor ? 'flex-end' : 'flex-start',
                right: isAuthor ? spacing(6) : undefined,
                left: !isAuthor ? spacing(6) : undefined
              }
            ]}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.reactionsContainer,
            {
              top: messageTop - REACTION_CONTAINER_HEIGHT,
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
            selectedReaction={selectedReaction as ReactionTypes}
            onChange={(reaction) => {
              if (reaction) {
                handleReactionSelected(message, reaction)
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
  ) : null
}
