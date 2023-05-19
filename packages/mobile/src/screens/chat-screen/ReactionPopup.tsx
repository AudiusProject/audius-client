import { useCallback, useState } from 'react'

import type {
  ChatMessageWithExtras,
  Nullable,
  ReactionTypes
} from '@audius/common'
import { chatActions, encodeHashId, accountSelectors } from '@audius/common'
import Clipboard from '@react-native-clipboard/clipboard'
import { View, Text, Dimensions, Pressable, Animated } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconCopy from 'app/assets/images/iconCopy2.svg'
import { usePopupAnimation } from 'app/hooks/usePopupAnimation'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemeColors } from 'app/utils/theme'

import { ReactionList } from '../notifications-screen/Reaction'

import { ChatMessageListItem } from './ChatMessageListItem'
import {
  REACTION_CONTAINER_HEIGHT,
  REACTION_CONTAINER_TOP_OFFSET
} from './constants'

const { getUserId } = accountSelectors
const { setMessageReaction } = chatActions

const messages = {
  copy: 'Copy Message'
}

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
  },
  copyPressableContainer: {
    position: 'absolute',
    dipslay: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    zIndex: 100
  },
  copyAnimatedContainer: {
    dipslay: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    zIndex: 100
  },
  copyText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontByWeight.bold,
    color: palette.white,
    zIndex: 100
  },
  icon: {
    height: spacing(3),
    width: spacing(3),
    fill: palette.white,
    a: 'asdf'
  }
}))

type ReactionPopupProps = {
  chatId: string
  messageTop: number
  messageWidth: number
  messageHeight: number
  containerTop: number
  containerBottom: number
  isAuthor: boolean
  message: ChatMessageWithExtras
  shouldShowPopup: boolean
  onClose: () => void
}

export const ReactionPopup = ({
  chatId,
  messageTop,
  messageWidth,
  messageHeight,
  containerTop,
  containerBottom,
  isAuthor,
  message,
  shouldShowPopup,
  onClose
}: ReactionPopupProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const { white } = useThemeColors()
  const userId = useSelector(getUserId)
  const userIdEncoded = encodeHashId(userId)
  const selectedReaction = message.reactions?.find(
    (r) => r.user_id === userIdEncoded
  )?.reaction
  const [isPressed, setIsPressed] = useState(false)

  const [
    backgroundOpacityAnim,
    otherOpacityAnim,
    translationAnim,
    handleClosePopup
  ] = usePopupAnimation(onClose)

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

  const handleCopyPress = useCallback(
    (message: string) => {
      Clipboard.setString(message)
      handleClosePopup()
    },
    [handleClosePopup]
  )

  return shouldShowPopup ? (
    <>
      <Animated.View
        style={[
          styles.dimBackground,
          { opacity: backgroundOpacityAnim.current }
        ]}
      />
      <Pressable
        style={styles.outerPressable}
        onPress={() => {
          console.log('parent press')
          handleClosePopup()
        }}
      />
      {/* This View cuts off the message body when it goes beyond the
      bottom boundary of the flatlist view. */}
      <View
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
        <Pressable
          style={[styles.innerPressable]}
          onPress={() => {
            console.log('inner press')
            handleClosePopup()
          }}
        />
        <Animated.View
          style={{ opacity: otherOpacityAnim.current, zIndex: 40 }}
        >
          <View>
            <ChatMessageListItem
              chatId={chatId}
              message={message}
              isPopup={true}
              style={[
                styles.popupChatMessage,
                {
                  top: messageTop - containerTop,
                  right: isAuthor ? spacing(6) : undefined,
                  left: !isAuthor ? spacing(6) : undefined
                }
              ]}
            />
          </View>
        </Animated.View>
        <Pressable
          onPress={() => handleCopyPress(message.message)}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={[
            styles.copyPressableContainer,
            {
              top: messageTop - containerTop + messageHeight + spacing(2.5),
              right: isAuthor ? spacing(6) : undefined,
              left: isAuthor ? undefined : spacing(6)
            }
          ]}
        >
          <Animated.View
            style={[
              styles.copyAnimatedContainer,
              { opacity: isPressed ? 0.5 : 1 }
            ]}
          >
            <IconCopy fill={white} height={12} width={12} />
            <Text style={styles.copyText}>{messages.copy}</Text>
          </Animated.View>
        </Pressable>
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
              opacity: otherOpacityAnim.current,
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
            isVisible={shouldShowPopup}
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
