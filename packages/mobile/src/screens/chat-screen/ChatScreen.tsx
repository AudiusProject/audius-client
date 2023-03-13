import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  Fragment
} from 'react'

import {
  chatActions,
  accountSelectors,
  chatSelectors,
  encodeUrlName,
  decodeHashId,
  encodeHashId,
  Status,
  hasTail,
  isEarliestUnread
} from '@audius/common'
import type { ReactionTypes, Nullable } from '@audius/common'
import type { ChatMessage } from '@audius/sdk'
import { Portal } from '@gorhom/portal'
import { useFocusEffect } from '@react-navigation/native'
import { View, Text, Image } from 'react-native'
import type { FlatList as RNFlatList } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import WavingHand from 'app/assets/images/emojis/waving-hand-sign.png'
import IconKebabHorizontal from 'app/assets/images/iconKebabHorizontal.svg'
import IconSend from 'app/assets/images/iconSend.svg'
import { TextInput, Screen, FlatList, ScreenContent } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { ProfilePicture } from 'app/components/user'
import { UserBadges } from 'app/components/user-badges'
import { useRoute } from 'app/hooks/useRoute'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemePalette } from 'app/utils/theme'

import { ChatMessageListItem } from './ChatMessageListItem'
import { ReactionPopup } from './ReactionPopup'

const {
  getChatMessages,
  getOtherChatUsers,
  getChatMessagesStatus,
  getChatMessagesSummary,
  getChat
} = chatSelectors

const { fetchMoreMessages, sendMessage, markChatAsRead, setMessageReaction } =
  chatActions
const { getUserId } = accountSelectors

const messages = {
  title: 'Messages',
  startNewMessage: 'Start a New Message',
  newMessage: 'New Message',
  sayHello: 'Say Hello!',
  firstImpressions: 'First impressions are important, so make it count!'
}
const ICON_BLUR = 0.5
const ICON_FOCUS = 1
const REACTION_CONTAINER_HEIGHT = 100

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between'
  },
  listContainer: {
    flex: 1
  },
  flatListContainer: {
    paddingHorizontal: spacing(6),
    display: 'flex'
  },
  composeView: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderColor: palette.neutralLight8
  },
  composeTextContainer: {
    backgroundColor: palette.neutralLight10,
    borderRadius: spacing(1),
    paddingLeft: spacing(4),
    paddingRight: spacing(4),
    display: 'flex',
    alignItems: 'center'
  },
  composeTextInput: {
    fontSize: typography.fontSize.medium
  },
  icon: {
    marginBottom: 2,
    width: spacing(5),
    height: spacing(5),
    fill: palette.primary
  },
  userBadgeTitle: {
    fontSize: typography.fontSize.medium,
    fontWeight: '800',
    color: palette.neutral
  },
  profilePicture: {
    width: spacing(6),
    height: spacing(6),
    marginRight: spacing(2)
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
  sayHelloContainer: {
    marginTop: spacing(8),
    marginHorizontal: spacing(6),
    padding: spacing(6),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.neutralLight7,
    borderWidth: 1,
    borderRadius: spacing(2)
  },
  sayHelloTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginHorizontal: spacing(6)
  },
  wavingHand: {
    height: spacing(16),
    width: spacing(16)
  },
  sayHelloTitle: {
    fontSize: typography.fontSize.xxl,
    color: palette.neutral,
    fontFamily: typography.fontByWeight.bold,
    lineHeight: typography.fontSize.xxl * 1.3
  },
  sayHelloText: {
    marginTop: spacing(2),
    marginRight: spacing(6),
    fontSize: typography.fontSize.large,
    lineHeight: typography.fontSize.large * 1.3,
    color: palette.neutral
  }
}))

const pluralize = (message: string, shouldPluralize: boolean) =>
  message + (shouldPluralize ? 's' : '')

const EmptyChatMessages = () => {
  const styles = useStyles()
  return (
    <View style={styles.sayHelloContainer}>
      <Image style={styles.wavingHand} source={WavingHand} />
      <View style={styles.sayHelloTextContainer}>
        <Text style={styles.sayHelloTitle}>{messages.sayHello}</Text>
        <Text style={styles.sayHelloText}>{messages.firstImpressions}</Text>
      </View>
    </View>
  )
}

export const ChatScreen = () => {
  const styles = useStyles()
  const palette = useThemePalette()
  const dispatch = useDispatch()

  const { params } = useRoute<'Chat'>()
  const { chatId } = params
  const url = `/chat/${encodeUrlName(chatId ?? '')}`
  const [iconOpacity, setIconOpacity] = useState<number>(ICON_BLUR)
  const [inputMessage, setInputMessage] = useState<string>('')
  const [shouldShowPopup, setShouldShowPopup] = useState<boolean>(false)
  const [reactionY, setReactionY] = useState<number>(0)
  const [messageY, setMessageY] = useState<number>(0)
  const [selectedReaction, setSelectedReaction] = useState<string>('')
  const [popupChatIndex, setPopupChatIndex] = useState<number | null>(null)
  const [popupChatHasTail, setPopupChatHasTail] = useState<boolean>(false)
  const [popupIsAuthor, setPopupIsAuthor] = useState<boolean>(false)
  const [composeY, setComposeY] = useState<number>(0)
  const [rootY, setRootY] = useState<number>(0)

  const userId = useSelector(getUserId)
  const userIdEncoded = encodeHashId(userId)
  const chat = useSelector((state) => getChat(state, chatId ?? ''))
  const [otherUser] = useSelector((state) => getOtherChatUsers(state, chatId))
  const chatMessages = useSelector((state) =>
    getChatMessages(state, chatId ?? '')
  )
  const status = useSelector((state) =>
    getChatMessagesStatus(state, chatId ?? '')
  )
  const summary = useSelector((state) =>
    getChatMessagesSummary(state, chatId ?? '')
  )
  const flatListRef = useRef<RNFlatList>(null)
  const itemsRef = useRef<(View | null)[]>([])
  const rootContainerRef = useRef<View | null>(null)
  const messageRef = useRef<ChatMessage | null>(null)
  const composeRef = useRef<View | null>(null)
  const unreadCount = chat?.unread_message_count ?? 0
  const isLoading = status === Status.LOADING && chatMessages?.length === 0

  // A ref so that the unread separator doesn't disappear immediately when the chat is marked as read
  // Using a ref instead of state here to prevent unwanted flickers.
  // The chat/chatId selectors will trigger the rerenders necessary.
  const chatFrozenRef = useRef(chat)

  useEffect(() => {
    if (chatId && status === Status.IDLE) {
      // Initial fetch
      dispatch(fetchMoreMessages({ chatId }))
    }
  }, [dispatch, chatId, status, summary])

  useEffect(() => {
    // Update chatFrozenRef when entering a new chat screen
    if (chat && chatId !== chatFrozenRef.current?.chat_id) {
      chatFrozenRef.current = chat
    }
  }, [chatId, chat])

  useEffect(() => {
    if (chatMessages) {
      itemsRef.current = itemsRef.current.slice(0, chatMessages.length)
    }
  }, [chatMessages])

  const earliestUnreadIndex = useMemo(
    () =>
      chatMessages?.findIndex((item, index) =>
        isEarliestUnread({
          unreadCount: chatFrozenRef?.current?.unread_message_count ?? 0,
          lastReadAt: chatFrozenRef?.current?.last_read_at,
          currentMessageIndex: index,
          messages: chatMessages,
          currentUserId: userIdEncoded
        })
      ),
    [chatMessages, userIdEncoded]
  )

  const handleSubmit = useCallback(
    (message) => {
      if (chatId && message) {
        dispatch(sendMessage({ chatId, message }))
        setInputMessage('')
        setIconOpacity(ICON_BLUR)
      }
    },
    [chatId, setInputMessage, dispatch]
  )

  useEffect(() => {
    if (
      earliestUnreadIndex &&
      chatMessages &&
      earliestUnreadIndex > 0 &&
      earliestUnreadIndex < chatMessages.length
    ) {
      flatListRef.current?.scrollToIndex({
        index: earliestUnreadIndex,
        viewPosition: 0.5,
        animated: false
      })
    }
  }, [earliestUnreadIndex, chatMessages])

  const handleScrollToIndexFailed = (e) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: e.index,
        viewPosition: 0.5,
        animated: false
      })
    }, 10)
  }

  const handleScrollToTop = () => {
    if (
      chatId &&
      status !== Status.LOADING &&
      summary &&
      summary.prev_count > 0
    ) {
      // Fetch more messages when user reaches the top
      dispatch(fetchMoreMessages({ chatId }))
    }
  }

  // Mark chat as read when user navigates away from screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        dispatch(markChatAsRead({ chatId }))
      }
    }, [dispatch, chatId])
  )

  const handleKebabPress = () => {
    dispatch(
      setVisibility({
        drawer: 'ChatActions',
        visible: true,
        data: { userId: otherUser.user_id }
      })
    )
  }

  const closeReactionPopup = useCallback(() => {
    setShouldShowPopup(false)
    setPopupChatIndex(null)
  }, [setShouldShowPopup, setPopupChatIndex])

  const handleReactionSelected = useCallback(
    (message: Nullable<ChatMessage>, reaction: ReactionTypes) => {
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
      closeReactionPopup()
    },
    [dispatch, userIdEncoded, chatId, userId, closeReactionPopup]
  )

  const handleLongPress = async (itemRef) => {
    const selectedReactionValue = messageRef?.current?.reactions?.find(
      (r) => r.user_id === encodeHashId(userId)
    )?.reaction
    if (selectedReactionValue) {
      setSelectedReaction(selectedReactionValue)
    }

    const measuredRootY: number = await new Promise<number>((resolve) => {
      rootContainerRef.current?.measureInWindow(
        (x, rooty, width, rootheight) => {
          resolve(rooty)
        }
      )
    })
    const { top: messageY, height: messageHeight } = await new Promise<{
      top: number
      height: number
    }>((resolve) => {
      itemRef.measureInWindow((left, top, width, height) => {
        resolve({ top: top - spacing(2), height })
      })
    })

    const spaceAboveMessage = messageY - measuredRootY
    const showAbove = spaceAboveMessage > REACTION_CONTAINER_HEIGHT
    const reactionY = showAbove
      ? messageY - REACTION_CONTAINER_HEIGHT - measuredRootY + spacing(3.5)
      : messageY + messageHeight - measuredRootY + spacing(4)
    setReactionY(reactionY)
    setMessageY(messageY - measuredRootY)
    setRootY(measuredRootY)
    setShouldShowPopup(true)
  }

  const topBarRight = (
    <IconKebabHorizontal
      onPress={handleKebabPress}
      fill={palette.neutralLight4}
    />
  )

  return (
    <Screen
      url={url}
      headerTitle={
        otherUser
          ? () => (
              <>
                <ProfilePicture
                  profile={otherUser}
                  style={styles.profilePicture}
                />
                <UserBadges
                  user={otherUser}
                  nameStyle={styles.userBadgeTitle}
                />
              </>
            )
          : messages.title
      }
      topbarRight={topBarRight}
    >
      <ScreenContent>
        <Portal hostName='ChatReactionsPortal'>
          {shouldShowPopup && popupChatIndex !== null ? (
            <ReactionPopup
              containerTop={rootY}
              containerBottom={composeY}
              messageTop={messageY}
              reactionTop={reactionY}
              selectedReaction={selectedReaction as ReactionTypes}
              isAuthor={popupIsAuthor}
              hasTail={popupChatHasTail}
              message={chatMessages[popupChatIndex]}
              closePopup={closeReactionPopup}
              handleReactionSelected={(reaction) =>
                handleReactionSelected(messageRef.current, reaction)
              }
            />
          ) : null}
        </Portal>
        <View style={styles.rootContainer} ref={rootContainerRef}>
          {!isLoading ? (
            chatMessages?.length > 0 ? (
              <View style={styles.listContainer}>
                <FlatList
                  contentContainerStyle={styles.flatListContainer}
                  data={chatMessages}
                  keyExtractor={(message) => message.message_id}
                  renderItem={({ item, index }) => (
                    <Fragment key={item.message_id}>
                      <TouchableWithoutFeedback
                        onPress={() => {
                          messageRef.current = chatMessages[index]
                          setPopupChatHasTail(
                            hasTail(item, chatMessages[index - 1])
                          )
                          const senderUserId = decodeHashId(item.sender_user_id)
                          const isAuthor = senderUserId === userId
                          setPopupIsAuthor(isAuthor)
                          handleLongPress(itemsRef.current[index])
                          setPopupChatIndex(index)
                        }}
                      >
                        <View>
                          {/* When reaction popup opens, hide reaction here so it doesn't
                          appear underneath the reaction of the message clone inside the
                          portal. */}
                          <ChatMessageListItem
                            message={item}
                            ref={(el) => (itemsRef.current[index] = el)}
                            shouldShowReaction={index !== popupChatIndex}
                            hasTail={hasTail(item, chatMessages[index - 1])}
                          />
                        </View>
                      </TouchableWithoutFeedback>
                      {index === earliestUnreadIndex ? (
                        <View style={styles.unreadTagContainer}>
                          <View style={styles.unreadSeparator} />
                          <Text style={styles.unreadTag}>
                            {unreadCount}{' '}
                            {pluralize(messages.newMessage, unreadCount > 1)}
                          </Text>
                          <View style={styles.unreadSeparator} />
                        </View>
                      ) : null}
                    </Fragment>
                  )}
                  onEndReached={handleScrollToTop}
                  inverted
                  initialNumToRender={chatMessages?.length}
                  ref={flatListRef}
                  onScrollToIndexFailed={handleScrollToIndexFailed}
                  refreshing={status === Status.LOADING}
                />
              </View>
            ) : (
              <EmptyChatMessages />
            )
          ) : (
            <LoadingSpinner />
          )}

          <View
            style={styles.composeView}
            onLayout={() => {
              composeRef.current?.measureInWindow(
                (x, composeY, width, rootheight) => {
                  setComposeY(composeY)
                }
              )
            }}
            ref={composeRef}
          >
            <TextInput
              placeholder={messages.startNewMessage}
              Icon={() => (
                <IconSend
                  fill={palette.primary}
                  width={styles.icon.width}
                  height={styles.icon.height}
                  opacity={iconOpacity}
                  onPress={() => handleSubmit(inputMessage)}
                />
              )}
              styles={{
                root: styles.composeTextContainer,
                input: styles.composeTextInput
              }}
              onChangeText={(text) => {
                setInputMessage(text)
                text ? setIconOpacity(ICON_FOCUS) : setIconOpacity(ICON_BLUR)
              }}
              onBlur={() => setIconOpacity(ICON_BLUR)}
              multiline
              value={inputMessage}
            />
          </View>
        </View>
      </ScreenContent>
    </Screen>
  )
}
