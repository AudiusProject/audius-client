import { User } from 'audius-client/src/common/models/User'
import { formatCount } from 'audius-client/src/common/utils/formatUtil'
import { StyleProp, View, ViewStyle, Text } from 'react-native'

import { makeStyles } from 'app/styles'

import { ProfilePicture } from './ProfilePicture'

const USER_LENGTH_LIMIT = 9

/**
 * Not all profile picture lists have the same profile picture size.
 * Some components pass in the dimensions (width and height) while others
 * use the default of spacing(10) - 2 (which is equal to 38).
 * We use the dimensions to determine how to position the
 * extra profile picture +N text.
 */
const defaultImageDimensions = { width: 38, height: 38 }

const useStyles = makeStyles(
  ({ spacing, palette, typography }, { imageDimensions }) => ({
    root: {
      flexDirection: 'row'
    },
    image: {
      marginRight: spacing(-2)
    },
    imageExtraRoot: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    imageCount: {
      width: imageDimensions.width,
      marginLeft: spacing(2) - imageDimensions.width,
      textAlign: 'center',
      color: palette.white,
      fontSize: typography.fontSize.small,
      fontFamily: typography.fontByWeight.bold
    }
  })
)

type ProfilePictureListProps = {
  users: User[]
  totalUserCount?: number
  limit?: number
  style?: StyleProp<ViewStyle>
  navigationType?: 'push' | 'navigate'
  interactive?: boolean
  imageStyles?: {
    width?: number | string | undefined
    height?: number | string | undefined
  }
}

export const ProfilePictureList = (props: ProfilePictureListProps) => {
  const {
    users,
    totalUserCount = users.length,
    limit = USER_LENGTH_LIMIT,
    style,
    navigationType,
    interactive,
    imageStyles
  } = props
  const styles = useStyles({
    imageDimensions: imageStyles || defaultImageDimensions
  })
  const showUserListDrawer = totalUserCount > limit
  const remainingUsersCount = totalUserCount - limit + 1
  const sliceLimit = showUserListDrawer ? limit - 1 : limit

  return (
    <View style={[styles.root, style]}>
      {users
        .filter(u => !u.is_deactivated)
        .slice(0, sliceLimit)
        .map(user => (
          <ProfilePicture
            profile={user}
            key={user.user_id}
            style={{ ...styles.image, ...imageStyles }}
            navigationType={navigationType}
            interactive={interactive}
          />
        ))}
      {showUserListDrawer ? (
        <View style={styles.imageExtraRoot}>
          <ProfilePicture
            profile={users[limit]}
            style={{ ...styles.image, ...imageStyles }}
            navigationType={navigationType}
            interactive={interactive}
          />
          <Text style={styles.imageCount}>
            {`+${formatCount(remainingUsersCount)}`}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
