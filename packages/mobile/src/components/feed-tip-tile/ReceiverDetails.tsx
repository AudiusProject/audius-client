import { useCallback, useState } from 'react'

import { User } from 'audius-client/src/common/models/User'
import { profilePage } from 'audius-client/src/utils/route'
import { View } from 'react-native'
import {
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native-gesture-handler'

import { Text } from 'app/components/core'
import { ProfilePicture } from 'app/components/user'
import UserBadges from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

import { PressableText } from './PressableText'

const useStyles = makeStyles(({ spacing, typography }) => ({
  receiver: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(4)
  },
  profilePicture: {
    width: 42,
    height: 42
  },
  receiverInfo: {
    marginLeft: spacing(2)
  },
  receiverNameContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  receiverName: {
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.bold
  },
  receiverHandle: {
    marginTop: spacing(1),
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.demiBold
  },
  textUnderline: {
    textDecorationLine: 'underline'
  }
}))

type ReceiverDetailsProps = {
  receiver: User
}

export const ReceiverDetails = ({ receiver }: ReceiverDetailsProps) => {
  const styles = useStyles()
  const navigation = useNavigation()

  const goToReceiverProfile = useCallback(() => {
    navigation.navigate({
      native: { screen: 'Profile', params: { handle: receiver.handle } },
      web: { route: profilePage(receiver.handle) }
    })
  }, [navigation, receiver])

  return (
    <View style={styles.receiver}>
      <TouchableOpacity onPress={goToReceiverProfile}>
        <ProfilePicture profile={receiver} style={styles.profilePicture} />
      </TouchableOpacity>
      <View style={styles.receiverInfo}>
        <PressableText onPress={goToReceiverProfile}>
          {({ pressed }) => (
            <Text
              style={[
                styles.receiverNameContainer,
                pressed && styles.textUnderline
              ]}>
              <Text variant='h3' style={styles.receiverName}>
                {receiver.name}
              </Text>
              <UserBadges user={receiver} badgeSize={12} hideName />
            </Text>
          )}
        </PressableText>
        <PressableText onPress={goToReceiverProfile}>
          {({ pressed }) => (
            <Text
              variant='h4'
              style={[styles.receiverHandle, pressed && styles.textUnderline]}>
              @{receiver.handle}
            </Text>
          )}
        </PressableText>
      </View>
    </View>
  )
}
