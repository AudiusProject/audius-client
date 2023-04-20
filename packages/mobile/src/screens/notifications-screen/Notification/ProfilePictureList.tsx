import type { User } from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'

import { makeStyles } from 'app/styles'

import { ProfilePicture } from './ProfilePicture'

const USER_LENGTH_LIMIT = 9

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
  root: {
    flexDirection: 'row'
  },
  image: {
    marginRight: spacing(-2)
  }
}))

type ProfilePictureListProps = {
  users: User[]
  limit?: number
  style?: StyleProp<ViewStyle>
  navigationType?: 'push' | 'navigate'
  interactive?: boolean
  imageStyles?: {
    width?: number
    height?: number
  }
}

export const ProfilePictureList = (props: ProfilePictureListProps) => {
  const {
    users,
    limit = USER_LENGTH_LIMIT,
    style,
    navigationType,
    interactive,
    imageStyles
  } = props
  const styles = useStyles()

  // TODO: change layering direction so that right-most is on top
  return (
    <View style={[styles.root, style]}>
      {users
        .filter((u) => !u.is_deactivated)
        .slice(0, limit)
        .map((user) => (
          <ProfilePicture
            profile={user}
            key={user.user_id}
            style={[styles.image, imageStyles]}
            navigationType={navigationType}
            interactive={interactive}
          />
        ))}
    </View>
  )
}
