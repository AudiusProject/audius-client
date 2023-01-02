import {
  accountSelectors,
  useAccountHasClaimableRewards,
  StringKeys
} from '@audius/common'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import type { Node } from 'react-native-reanimated'
import Animated from 'react-native-reanimated'
import { useSelector } from 'react-redux'

import { ProfilePicture } from 'app/components/user'
import { useRemoteVar } from 'app/hooks/useRemoteConfig'
import { makeStyles } from 'app/styles'
import { useDrawerProgress } from '@react-navigation/drawer'
const { getAccountUser } = accountSelectors

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

  // @ts-expect-error type incorrect until we stop using legacy reanimated
  const opacity = Animated.interpolateNode(drawerProgress, {
    inputRange: [0, 1],
    outputRange: [1, 0]
  })

  return (
    <Animated.View style={{ opacity }}>
      <TouchableOpacity onPress={onPress}>
        <ProfilePicture
          profile={accountUser}
          style={styles.root}
          firstOpacity={0}
        />
        {hasClaimableRewards ? (
          <View style={styles.notificationBubbleRoot}>
            <View style={styles.notificationBubble} />
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  )
}
