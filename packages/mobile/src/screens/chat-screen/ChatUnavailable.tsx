import { useCallback, useMemo } from 'react'

import type { User } from '@audius/common'
import { chatSelectors, ChatPermissionAction } from '@audius/common'
import { View, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { UserBadges } from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

const { getCanSendMessage } = chatSelectors

const messages = {
  noAction: 'You can no longer send messages to asdf asdf asdf adsf asdf ',
  tip1: 'You must send ',
  tip2: ' a tip before you can send them messages.',
  blockee: 'You cannot send messages to users you have blocked. ',
  learnMore: 'Learn More.',
  unblockUser: 'Unblock User.'
}

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: spacing(19),
    paddingHorizontal: spacing(6)
  },
  unavailableText: {
    textAlign: 'center',
    fontSize: typography.fontSize.medium,
    lineHeight: typography.fontSize.medium * 1.3,
    color: palette.neutral
  },
  link: {
    color: palette.secondary
  }
}))

type ChatUnavailableProps = {
  user: User
  chatId: string
}

export const ChatUnavailable = ({ user, chatId }: ChatUnavailableProps) => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { callToAction } = useSelector((state) =>
    getCanSendMessage(state, { userId: user.user_id, chatId })
  )

  // TODO: link to blog
  const handleLearnMorePress = useCallback(() => {}, [])

  const handleUnblockPress = useCallback(() => {
    dispatch(
      setVisibility({
        drawer: 'BlockMessages',
        visible: true,
        data: { userId: user.user_id }
      })
    )
  }, [dispatch, user])

  const mapActionToProps = useMemo(() => {
    return {
      [ChatPermissionAction.NONE]: () => (
        <>
          <Text style={styles.unavailableText}>
            {messages.noAction}
            <UserBadges
              user={user}
              as={Text}
              nameStyle={styles.unavailableText}
            />
            <Text
              style={[styles.unavailableText, styles.link]}
              onPress={handleLearnMorePress}
            >
              {messages.learnMore}
            </Text>
          </Text>
        </>
      ),
      [ChatPermissionAction.TIP]: () => (
        <>
          <Text style={styles.unavailableText}>
            {messages.tip1}
            <Text
              onPress={() =>
                navigation.navigate('Profile', { id: user.user_id })
              }
            >
              <UserBadges
                user={user}
                as={Text}
                nameStyle={[styles.unavailableText, styles.link]}
              />
            </Text>
            {messages.tip2}
          </Text>
        </>
      ),
      [ChatPermissionAction.UNBLOCK]: () => (
        <>
          <Text style={styles.unavailableText}>
            {messages.blockee}
            <Text
              style={[styles.unavailableText, styles.link]}
              onPress={handleUnblockPress}
            >
              {messages.unblockUser}
            </Text>
          </Text>
        </>
      ),
      [ChatPermissionAction.WAIT]: () => null
    }
  }, [
    handleLearnMorePress,
    handleUnblockPress,
    navigation,
    styles.link,
    styles.unavailableText,
    user
  ])

  return <View style={styles.root}>{mapActionToProps[callToAction]()}</View>
}
