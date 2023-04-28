import { useCallback } from 'react'

import { chatSelectors, useProxySelector } from '@audius/common'
import type { UserChat } from '@audius/sdk'
import { View, TouchableHighlight } from 'react-native'

import { Text } from 'app/components/core'
import { ProfilePicture } from 'app/components/user'
import { UserBadges } from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

import type { AppTabScreenParamList } from '../app-screen'

const { getOtherChatUsersFromChat } = chatSelectors

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    height: spacing(28),
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    backgroundColor: palette.white,
    borderColor: palette.neutralLight8,
    borderBottomWidth: 1
  },
  loadingSpinnerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentRoot: {
    display: 'flex',
    flexDirection: 'row'
  },
  profilePicture: {
    width: spacing(12),
    height: spacing(12),
    borderWidth: 1,
    borderColor: palette.neutralLight9
  },
  userContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 2,
    marginLeft: spacing(2),
    marginBottom: spacing(2)
  },
  userNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: spacing(1)
  },
  userName: {
    fontSize: typography.fontSize.large,
    fontWeight: 'bold',
    color: palette.neutral
  },
  handle: {
    fontSize: typography.fontSize.small
  }
}))

export const ChatListItem = ({ chat }: { chat: UserChat }) => {
  const currentChatId = chat.chat_id
  const navigation = useNavigation<AppTabScreenParamList>()
  const styles = useStyles()

  const user = useProxySelector(
    (state) => getOtherChatUsersFromChat(state, chat),
    [chat]
  )[0]

  const handlePress = useCallback(() => {
    navigation.push('Chat', { chatId: currentChatId })
  }, [navigation, currentChatId])

  return (
    <TouchableHighlight onPress={handlePress}>
      <View style={styles.root}>
        {user ? (
          <>
            <View style={styles.contentRoot}>
              <ProfilePicture profile={user} style={styles.profilePicture} />
              <View style={styles.userContainer}>
                <View style={styles.userNameContainer}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <UserBadges user={user} hideName />
                </View>
                <Text style={styles.handle}>@{user.handle}</Text>
              </View>
            </View>
            <Text numberOfLines={1}>{chat.last_message}</Text>
          </>
        ) : null}
      </View>
    </TouchableHighlight>
  )
}
