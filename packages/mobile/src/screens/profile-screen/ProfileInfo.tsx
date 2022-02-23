import { getAccountUser } from 'audius-client/src/common/store/account/selectors'
import { ProfileUser } from 'audius-client/src/common/store/pages/profile/types'
import { View, Text } from 'react-native'

import { FollowButton } from 'app/components/user'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { makeStyles } from 'app/styles'

import { EditProfileButton } from './EditProfileButton'
import { SubscribeButton } from './SubscribeButton'

const useStyles = makeStyles(({ typography, palette, spacing }) => ({
  username: {
    ...typography.h1,
    color: palette.neutral
  },
  handle: {
    ...typography.h4,
    color: palette.neutralLight4
  },
  followsYou: {
    color: palette.neutralLight4,
    borderRadius: 4,
    overflow: 'hidden',
    borderColor: palette.neutralLight4,
    borderWidth: 1,
    paddingVertical: 3,
    width: spacing(20),
    textAlign: 'center',
    fontFamily: typography.fontByWeight.heavy,
    fontSize: 10,
    textTransform: 'uppercase'
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing(4)
  },
  actionButtons: {
    flexDirection: 'row'
  }
}))

type ProfileInfoProps = {
  profile: ProfileUser
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  const styles = useStyles()
  const { does_current_user_follow, does_follow_current_user } = profile
  const accountUser = useSelectorWeb(getAccountUser)
  const isOwner = accountUser?.user_id === profile.user_id

  return (
    <View style={styles.info}>
      <View>
        <Text accessibilityRole='header' style={styles.username}>
          {profile.name}
        </Text>
        <Text style={styles.handle}>@{profile.handle}</Text>
        {does_follow_current_user ? (
          <Text style={styles.followsYou}>Follows You</Text>
        ) : null}
      </View>
      {isOwner ? (
        <EditProfileButton />
      ) : (
        <View style={styles.actionButtons}>
          {does_current_user_follow ? <SubscribeButton /> : null}
          <FollowButton profile={profile} />
        </View>
      )}
    </View>
  )
}
