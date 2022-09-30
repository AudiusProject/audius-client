import {
  accountSelectors,
  useAccountHasClaimableRewards,
  StringKeys
} from '@audius/common'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'

import { ProfilePicture } from 'app/components/user'
import { useRemoteVar } from 'app/hooks/useRemoteConfig'
import { makeStyles } from 'app/styles'
const { getAccountUser } = accountSelectors

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    height: spacing(8) + 2,
    width: spacing(8) + 2,
    borderWidth: 1
  },
  notificationBubble: {
    height: spacing(4),
    width: spacing(4),
    borderColor: palette.white,
    borderWidth: 2,
    borderRadius: spacing(2),
    backgroundColor: palette.secondary,
    position: 'absolute',
    top: 0,
    right: 0
  }
}))

type AccountPictureHeaderProps = {
  onPress: () => void
}

export const AccountPictureHeader = (props: AccountPictureHeaderProps) => {
  const { onPress } = props
  const styles = useStyles()
  const accountUser = useSelector(getAccountUser)
  const challengeRewardIds = useRemoteVar(StringKeys.CHALLENGE_REWARD_IDS)
  const hasClaimableRewards = useAccountHasClaimableRewards(challengeRewardIds)

  return (
    <TouchableOpacity onPress={onPress}>
      <ProfilePicture
        profile={accountUser}
        style={styles.root}
        firstOpacity={0}
      />
      {hasClaimableRewards ? <View style={styles.notificationBubble} /> : null}
    </TouchableOpacity>
  )
}
