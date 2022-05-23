import { FollowSource } from 'audius-client/src/common/models/Analytics'
import { User } from 'audius-client/src/common/models/User'
import { View } from 'react-native'

import IconUser from 'app/assets/images/iconUser.svg'
import { Text } from 'app/components/core'
import {
  FollowButton,
  FollowsYouChip,
  ProfilePicture
} from 'app/components/user'
import UserBadges from 'app/components/user-badges'
import { makeStyles } from 'app/styles'
import { formatCount } from 'app/utils/format'

const messages = {
  followers: (followerCount: number) =>
    followerCount === 1 ? 'Follower' : 'Followers'
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    padding: spacing(4)
  },
  infoRoot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(2)
  },
  photo: {
    height: 72,
    width: 72
  },
  userInfo: {
    marginLeft: spacing(1),
    flex: 1
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  followerStats: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userIcon: {
    color: palette.neutralLight4
  },
  displayName: {
    marginBottom: spacing(1)
  },
  handle: {
    marginBottom: spacing(2)
  }
}))

type UserListItemProps = {
  user: User
}

export const UserListItem = (props: UserListItemProps) => {
  const { user } = props
  const { handle, name, follower_count, does_follow_current_user } = user
  const styles = useStyles()

  return (
    <View style={styles.root}>
      <View style={styles.infoRoot}>
        <ProfilePicture profile={user} style={styles.photo} />
        <View style={styles.userInfo}>
          <Text variant='h3' style={styles.displayName}>
            {name}
            <UserBadges user={user} badgeSize={10} hideName />
          </Text>
          <Text variant='body' style={styles.handle}>
            @{handle}
          </Text>
          <View style={styles.userStats}>
            <View style={styles.followerStats}>
              <IconUser height={15} width={15} fill={styles.userIcon.color} />
              <Text variant='body' color='neutralLight4'>
                <Text color='inherit' weight='bold'>
                  {' '}
                  {formatCount(follower_count)}
                </Text>{' '}
                {messages.followers(follower_count)}
              </Text>
            </View>
            {does_follow_current_user ? <FollowsYouChip /> : null}
          </View>
        </View>
      </View>
      <FollowButton
        profile={user}
        followSource={FollowSource.USER_LIST}
        fullWidth
        corners='pill'
      />
    </View>
  )
}
