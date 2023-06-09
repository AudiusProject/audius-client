import { useCallback, useRef } from 'react'

import type {
  ChatMessageWithExtras,
  Nullable,
  ReactionTypes
} from '@audius/common'
import { chatActions, encodeHashId, accountSelectors } from '@audius/common'
import Clipboard from '@react-native-clipboard/clipboard'
import { Dimensions, Pressable, Animated, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { usePopupAnimation } from 'app/hooks/usePopupAnimation'
import { useToast } from 'app/hooks/useToast'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { zIndex } from 'app/utils/zIndex'

import { ReactionList } from '../notifications-screen/Reaction'

import { ChatMessageListItem } from './ChatMessageListItem'
import { CopyMessagesButton } from './CopyMessagesButton'
import {
  REACTION_ANDROID_OFFSET,
  REACTION_CONTAINER_HEIGHT,
  REACTION_CONTAINER_TOP_OFFSET
} from './constants'

const { getUserId } = accountSelectors
const { setMessageReaction } = chatActions

const messages = {
  messageCopied: 'Message copied to clipboard'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  dimBackground: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: zIndex.CHAT_REACTIONS_POPUP_DIM_BACKGROUND,
    backgroundColor: 'black'
  },
  popupContainer: {
    position: 'absolute',
    display: 'flex',
    zIndex: zIndex.CHAT_REACTIONS_POPUP_CLOSE_PRESSABLES,
    overflow: 'hidden'
  },
  outerPressable: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: zIndex.CHAT_REACTIONS_POPUP_CLOSE_PRESSABLES
  },
  innerPressable: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: zIndex.CHAT_REACTIONS_POPUP_CLOSE_PRESSABLES
  },
  reactionsContainer: {
    borderWidth: 1,
    borderRadius: spacing(12),
    borderColor: palette.neutralLight9,
    zIndex: zIndex.CHAT_REACTIONS_POPUP_CONTENT,
    width: Dimensions.get('window').width - spacing(10),
    backgroundColor: palette.white,
    marginHorizontal: spacing(5)
  },
  popupChatMessage: {
    position: 'absolute',
    maxWidth: Dimensions.get('window').width - spacing(12),
    zIndex: zIndex.CHAT_REACTIONS_POPUP_CONTENT
  },
  emoji: {
    height: spacing(17)
  },
  copyPressableContainer: {
    position: 'absolute',
    dipslay: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    zIndex: zIndex.CHAT_REACTIONS_POPUP_CONTENT
  },
  copyAnimatedContainer: {
    dipslay: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    zIndex: zIndex.CHAT_REACTIONS_POPUP_CONTENT
  },
  copyText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontByWeight.bold,
    color: palette.white
  }
}))

type ReactionPopupProps = {
  chatId: string
  containerTop: number
  containerBottom: number
  messageTop: number
  messageHeight: number
  isAuthor: boolean
  message: ChatMessageWithExtras
  onClose: () => void
}

const addAndroidOffset = (value: number) => value + REACTION_ANDROID_OFFSET

export const ReactionPopup = ({
  chatId,
  containerTop: containerTopProp,
  containerBottom: containerBottomProp,
  messageTop: messageTopProp,
  messageHeight,
  isAuthor,
  message,
  onClose
}: ReactionPopupProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const userId = useSelector(getUserId)
  const { toast } = useToast()

  const newReaction = useRef<string>()
  const userIdEncoded = encodeHashId(userId)
  const selectedReaction = message.reactions?.find(
    (r) => r.user_id === userIdEncoded
  )?.reaction
  const messageTop =
    Platform.OS === 'android'
      ? addAndroidOffset(messageTopProp)
      : messageTopProp
  const containerBottom =
    Platform.OS === 'android'
      ? addAndroidOffset(containerBottomProp)
      : containerBottomProp
  const containerTop =
    Platform.OS === 'android'
      ? addAndroidOffset(containerTopProp)
      : containerTopProp

  const handleClose = useCallback(() => {
    // If the user selected a new reaction, dispatch with that reaction before closing
    // Prevents jitters
    if (userId && message && newReaction.current) {
      dispatch(
        setMessageReaction({
          userId,
          chatId,
          messageId: message.message_id,
          reaction:
            message.reactions?.find((r) => r.user_id === userIdEncoded)
              ?.reaction === newReaction.current
              ? null
              : newReaction.current
        })
      )
    }
    onClose()
  }, [userId, message, newReaction, onClose, dispatch, chatId, userIdEncoded])

  const [
    backgroundOpacityAnim,
    otherOpacityAnim,
    translationAnim,
    handleClosePopup
  ] = usePopupAnimation(handleClose)

  const handleReactionSelected = useCallback(
    (message: Nullable<ChatMessageWithExtras>, reaction: ReactionTypes) => {
      if (userId && message) {
        // Wait until after unmount animation to dispatch the new reaction
        newReaction.current = reaction
      }
      handleClosePopup()
    },
    [userId, handleClosePopup]
  )

  const handleCopyPress = useCallback(() => {
    Clipboard.setString(message.message)
    handleClosePopup()
    toast({ content: messages.messageCopied, type: 'info' })
  }, [message.message, handleClosePopup, toast])

  const handleReactionChanged = useCallback(
    (reaction) => {
      if (reaction) {
        handleReactionSelected(message, reaction)
      }
    },
    [message, handleReactionSelected]
  )

  return (
    <>
      <Animated.View
        style={[styles.dimBackground, { opacity: backgroundOpacityAnim }]}
      />
      <Pressable style={styles.outerPressable} onPress={handleClosePopup} />
      {/* This View cuts off the message body when it goes beyond the
      bottom boundary of the flatlist view. */}
      <Animated.View
        style={[
          styles.popupContainer,
          {
            height: containerBottom - containerTop,
            top: containerTop
          }
        ]}
      >
        {/* This 2nd pressable ensures that clicking outside of the
        message and reaction list, but inside of flatlist view,
        closes the popup. */}
        <Pressable style={styles.innerPressable} onPress={handleClosePopup} />
        <ChatMessageListItem
          chatId={chatId}
          messageId={message.message_id}
          isPopup={true}
          style={[
            styles.popupChatMessage,
            {
              top: messageTop - containerTop,
              right: isAuthor ? spacing(6) : undefined,
              left: !isAuthor ? spacing(6) : undefined
            }
          ]}
          handleClosePopup={handleClosePopup}
        />
        <Animated.View style={{ opacity: otherOpacityAnim }}>
          <CopyMessagesButton
            isAuthor={isAuthor}
            messageTop={messageTop}
            containerTop={containerTop}
            messageHeight={messageHeight}
            onPress={handleCopyPress}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.reactionsContainer,
            {
              top: Math.max(
                messageTop - containerTop - REACTION_CONTAINER_HEIGHT,
                containerTop -
                  REACTION_CONTAINER_HEIGHT -
                  REACTION_CONTAINER_TOP_OFFSET
              ),
              transform: [
                {
                  translateY: translationAnim
                }
              ]
            },
            { opacity: otherOpacityAnim }
          ]}
        >
          <ReactionList
            selectedReaction={selectedReaction as ReactionTypes}
            onChange={handleReactionChanged}
            isVisible={true}
            scale={1.6}
            style={{
              emoji: styles.emoji
            }}
          />
        </Animated.View>
      </Animated.View>
    </>
  )
}
