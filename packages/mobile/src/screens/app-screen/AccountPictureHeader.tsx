import {
  accountSelectors,
  chatSelectors,
  useAccountHasClaimableRewards,
  StringKeys,
  FeatureFlags
} from '@audius/common'
import { useDrawerProgress } from '@react-navigation/drawer'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import type { Adaptable } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'
import { useSelector } from 'react-redux'

import { ProfilePicture } from 'app/components/user'
import { useRemoteVar, useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { makeStyles } from 'app/styles'

const { getAccountUser } = accountSelectors
const { getHasUnreadMessages } = chatSelectors

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    height: spacing(8) + 2,
    width: spacing(8) + 2,
    borderWidth: 1
  },
  notificationBubbleRoot: {
    height: spacing(4),
    width: spacing(4),
    borderColor: palette.white,
    borderWidth: 2,
    borderRadius: 10,
    position: 'absolute',
    top: 0,
    right: 0
  },
  notificationBubble: {
    flex: 1,
    backgroundColor: palette.secondary,
    overflow: 'hidden',
    borderRadius: 10
  }
}))

type AccountPictureHeaderProps = {
  onPress: () => void
}

export const AccountPictureHeader = (props: AccountPictureHeaderProps) => {
  const { onPress } = props
  const drawerProgress = useDrawerProgress()
  const styles = useStyles()
  const accountUser = useSelector(getAccountUser)
  const challengeRewardIds = useRemoteVar(StringKeys.CHALLENGE_REWARD_IDS)
  const hasClaimableRewards = useAccountHasClaimableRewards(challengeRewardIds)
  const { isEnabled: isChatEnabled } = useFeatureFlag(FeatureFlags.CHAT_ENABLED)
  const hasUnreadMessages = useSelector(getHasUnreadMessages)
  const showNotificationBubble =
    hasClaimableRewards || (hasUnreadMessages && isChatEnabled)

  const opacity = Animated.interpolateNode(
    drawerProgress as Adaptable<number>,
    {
      inputRange: [0, 1],
      outputRange: [1, 0]
    }
  )

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity onPress={onPress}>
        <ProfilePicture
          profile={accountUser}
          style={styles.root}
          priority='high'
        />
        {showNotificationBubble ? (
          <View style={styles.notificationBubbleRoot}>
            <View style={styles.notificationBubble} />
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  )
}
