import { useEffect, useState } from 'react'

import {
  chatActions,
  chatSelectors,
  encodeUrlName,
  MESSAGE_GROUP_THRESHOLD_MINUTES,
  Status
} from '@audius/common'
import dayjs from 'dayjs'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import IconSend from 'app/assets/images/iconSend.svg'
import { TextInput, Screen, FlatList, ScreenContent } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
// import { UserBadges } from 'app/components/user-badges'
import { useRoute } from 'app/hooks/useRoute'
import { makeStyles } from 'app/styles'

import { ChatMessageListItem } from './ChatMessageListItem'

const { getChatMessages, getOtherChatUsers, getChatMessagesStatus } =
  chatSelectors
const { fetchMoreMessages } = chatActions

const messages = {
  title: 'Messages',
  startNewMessage: 'Start a New Message'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  rootContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between'
  },
  listContainer: {
    display: 'flex',
    width: '100%',
    flex: 1
  },
  flatListContainer: {
    paddingHorizontal: spacing(6),
    display: 'flex',
    flexDirection: 'column-reverse'
    // flex: 1
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
    alignItems: 'flex-end'
  },
  composeTextInput: {
    lineHeight: spacing(4),
    fontSize: typography.fontSize.medium,
    alignSelf: 'center'
  },
  icon: {
    marginBottom: 2,
    width: spacing(5),
    height: spacing(5),
    fill: palette.primary
  }
}))

/**
 * Checks to see if the message was sent within the time threshold for grouping it with the next message
 */
const hasTail = (message: ChatMessage, newMessage?: ChatMessage) => {
  if (!newMessage) return true
  return (
    message.sender_user_id !== newMessage.sender_user_id ||
    dayjs(newMessage.created_at).diff(message.created_at, 'minutes') >=
      MESSAGE_GROUP_THRESHOLD_MINUTES
  )
}

export const ChatScreen = () => {
  const styles = useStyles()
  const dispatch = useDispatch()

  const [iconOpacity, setIconOpacity] = useState(0.5)
  const [text, setText] = useState('')
  const { params } = useRoute<'Chat'>()
  const { chatId } = params
  const url = `/chat/${encodeUrlName(chatId)}`
  const chatMessages = useSelector((state) =>
    getChatMessages(state, chatId ?? '')
  )
  const status = useSelector((state) =>
    getChatMessagesStatus(state, chatId ?? '')
  )

  useEffect(() => {
    dispatch(fetchMoreMessages({ chatId }))
  }, [dispatch, chatId])

  const otherUser = useSelector((state) => getOtherChatUsers(state, chatId))

  return (
    <Screen
      url={url}
      // variant='secondary'
      title={otherUser[0] ? otherUser[0].handle : messages.title}
      style={styles.title}
    >
      <ScreenContent>
        <View style={styles.rootContainer}>
          {status === Status.SUCCESS ? (
            <View style={styles.listContainer}>
              <FlatList
                contentContainerStyle={styles.flatListContainer}
                style={styles.list}
                data={chatMessages}
                keyExtractor={(message) => message.chat_id}
                renderItem={({ item, index }) => {
                  return (
                    <ChatMessageListItem
                      message={item}
                      hasTail={hasTail(item, chatMessages[index - 1])}
                    />
                  )
                }}
              />
            </View>
          ) : (
            <LoadingSpinner />
          )}
          <View style={styles.composeView}>
            <TextInput
              placeholder={messages.startNewMessage}
              Icon={IconSend}
              styles={{
                root: styles.composeTextContainer,
                input: styles.composeTextInput,
                icon: { ...styles.icon, opacity: iconOpacity }
              }}
              onChangeText={(text) => {
                setText(text)
                text ? setIconOpacity(1) : setIconOpacity(0.5)
              }}
              onBlur={() => setIconOpacity(0.5)}
              multiline
              value={text}
            />
          </View>
        </View>
      </ScreenContent>
    </Screen>
  )
}
