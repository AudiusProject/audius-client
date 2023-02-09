import { useCallback } from 'react'

import { chatSelectors, useProxySelector } from '@audius/common'
import { View, TouchableHighlight } from 'react-native'

import { Text } from 'app/components/core'
import LoadingSpinner from 'app/components/loading-spinner'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

import type { AppTabScreenParamList } from '../app-screen'

import { ChatUser } from './ChatUser'

const { getOtherChatUsersFromChat } = chatSelectors

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    height: spacing(28),
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(10),
    backgroundColor: palette.white,
    borderColor: palette.neutralLight8,
    borderBottomWidth: 1
  }
}))

export const ChatListItem = ({ chat }: { UserChat }) => {
  const currentChatId = chat.chat_id
  const navigation = useNavigation<AppTabScreenParamList>()
  const styles = useStyles()

  const users = useProxySelector(
    (state) => getOtherChatUsersFromChat(state, chat),
    [chat]
  )

  const handlePress = useCallback(() => {
    navigation.navigate('Chat', { chatId: currentChatId })
  }, [navigation, currentChatId])

  if (!users[0]) {
    return <LoadingSpinner />
  }

  return (
    <TouchableHighlight onPress={handlePress}>
      <View style={styles.root}>
        <ChatUser user={users[0]} />
        <Text style={styles.title} numberOfLines={1}>
          {chat.last_message}
        </Text>
      </View>
    </TouchableHighlight>
  )
}
