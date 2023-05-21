import { useCallback, useEffect } from 'react'

import { chatActions, chatSelectors, Status } from '@audius/common'
import { View, Text } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'

import IconCompose from 'app/assets/images/iconCompose.svg'
import IconMessage from 'app/assets/images/iconMessage.svg'
import Button, { ButtonType } from 'app/components/button'
import { Screen, FlatList, ScreenContent } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import type { AppTabScreenParamList } from 'app/screens/app-screen'
import { makeStyles } from 'app/styles'
import { useThemePalette, useColor } from 'app/utils/theme'

import { ChatListItem } from './ChatListItem'
import { ChatListItemSkeleton } from './ChatListItemSkeleton'

const {
  getChats,
  getChatsStatus,
  getAllOtherChatUsers,
  getNumberOfFetchChatRequests
} = chatSelectors
const { fetchMoreMessages, fetchMoreChats } = chatActions

const CHATS_MESSAGES_PREFETCH_LIMIT = 10

const messages = {
  title: 'Messages',
  startConversation: 'Start a Conversation!',
  connect:
    'Connect with other Audius users by\nstarting a private direct message!',
  writeMessage: 'Write a Message'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  rootContainer: {
    display: 'flex',
    flexGrow: 1
  },
  loadingSpinnerContainer: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingSpinner: {
    height: spacing(10),
    width: spacing(10)
  },
  listContainer: {
    display: 'flex',
    minHeight: '100%'
  },
  startConversationContainer: {
    marginVertical: spacing(8),
    marginHorizontal: spacing(4),
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.neutralLight7,
    borderRadius: spacing(2),
    padding: spacing(6)
  },
  startConversationTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontByWeight.bold,
    textAlign: 'center',
    lineHeight: typography.fontSize.xxl * 1.3,
    color: palette.neutral
  },
  connect: {
    fontSize: typography.fontSize.medium,
    textAlign: 'center',
    lineHeight: typography.fontSize.medium * 1.3,
    color: palette.neutral,
    marginTop: spacing(2)
  },
  writeMessageButton: {
    marginTop: spacing(6)
  },
  shadow: {
    borderBottomColor: palette.neutralLight6,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 1
  }
}))

const ChatsEmpty = ({ onPress }: { onPress: () => void }) => {
  const white = useColor('white')
  const styles = useStyles()
  return (
    <View style={styles.startConversationContainer}>
      <Text style={styles.startConversationTitle}>
        {messages.startConversation}
      </Text>
      <Text style={styles.connect}>{messages.connect}</Text>
      <Button
        title={messages.writeMessage}
        renderIcon={() => <IconCompose fill={white} />}
        iconPosition='left'
        onPress={onPress}
        containerStyle={styles.writeMessageButton}
        type={ButtonType.PRIMARY}
      />
    </View>
  )
}

export const ChatListScreen = () => {
  const styles = useStyles()
  const palette = useThemePalette()
  const dispatch = useDispatch()
  const navigation = useNavigation<AppTabScreenParamList>()
  const chats = useSelector(getChats)
  const chatsStatus = useSelector(getChatsStatus)
  const otherUsers = useSelector(getAllOtherChatUsers)

  // If this is the first fetch, we want to show the loading skeleton that
  // fades out. Otherwise, we want to show a skeleton in each incoming chat row.
  const numberOfFetchChatRequests = useSelector(getNumberOfFetchChatRequests)
  const isLoading =
    numberOfFetchChatRequests <= 1 &&
    ((chatsStatus ?? Status.LOADING) === Status.LOADING ||
      otherUsers.some((user) => !user))
  const navigateToChatUserList = () => navigation.navigate('ChatUserList')
  const iconCompose = (
    <TouchableWithoutFeedback onPress={navigateToChatUserList}>
      <IconCompose fill={palette.neutralLight4} />
    </TouchableWithoutFeedback>
  )

  // Prefetch messages for initial loaded chats
  useEffect(() => {
    if (
      chats.length > 0 &&
      chats.every(
        (chat) => !chat.messagesStatus || chat.messagesStatus === Status.IDLE
      )
    ) {
      chats.slice(0, CHATS_MESSAGES_PREFETCH_LIMIT).forEach((chat) => {
        dispatch(fetchMoreMessages({ chatId: chat.chat_id }))
      })
    }
  }, [chats, dispatch])

  const handleLoadMore = useCallback(() => {
    dispatch(fetchMoreChats())
  }, [dispatch])

  return (
    <Screen
      url='/chat'
      title={messages.title}
      variant='secondary'
      icon={IconMessage}
      topbarRight={iconCompose}
    >
      <ScreenContent>
        <View style={styles.shadow} />
        <View style={styles.rootContainer}>
          {isLoading ? (
            Array(4)
              .fill(null)
              .map((_, index) => (
                <ChatListItemSkeleton
                  key={index}
                  index={index}
                  shouldFade={true}
                />
              ))
          ) : (
            <FlatList
              data={chats}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => <ChatListItem chatId={item.chat_id} />}
              keyExtractor={(chat) => chat.chat_id}
              ListEmptyComponent={() => (
                <ChatsEmpty onPress={navigateToChatUserList} />
              )}
              onEndReached={handleLoadMore}
            />
          )}
        </View>
      </ScreenContent>
    </Screen>
  )
}
