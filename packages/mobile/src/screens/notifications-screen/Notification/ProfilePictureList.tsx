import { useMemo } from 'react'

import type { User } from '@audius/common'
import { formatCount } from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet, View, Text } from 'react-native'

import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'

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

const useStyles = makeStyles(({ spacing, palette, typography }) => ({
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
  imageExtraDim: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 15,
    width: 24,
    height: 24
  },
  imageCount: {
    textAlign: 'center',
    color: palette.staticWhite,
    fontSize: typography.fontSize.small,
    fontFamily: typography.fontByWeight.bold,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1
  }
}))

type ProfilePictureListProps = {
  users: User[]
  totalUserCount?: number
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
    totalUserCount = users.length,
    limit = USER_LENGTH_LIMIT,
    style,
    navigationType,
    interactive,
    imageStyles
  } = props
  const imageWidth = imageStyles?.width ?? defaultImageDimensions.width
  const styles = useStyles()
  const showUserListDrawer = totalUserCount > limit
  /**
   * We add a +1 because the remaining users count includes
   * the tile that has the +N itself.
   */
  const remainingUsersCount = totalUserCount - limit + 1
  /**
   * If the total user count is greater than the limit, then
   * we slice at limit -1 to exclude the tile with the +N, since
   * that tile will be handled separately.
   * Otherwise, we slice at the limit, which would include all
   * users.
   */
  const sliceLimit = showUserListDrawer ? limit - 1 : limit

  const profilePictureStyles = useMemo(
    () => StyleSheet.flatten([styles.image, imageStyles]),
    [styles.image, imageStyles]
  )

  return (
    <View style={[styles.root, style]}>
      {users
        .filter((u) => !u.is_deactivated)
        .slice(0, sliceLimit)
        .map((user) => (
          <ProfilePicture
            profile={user}
            key={user.user_id}
            style={profilePictureStyles}
            navigationType={navigationType}
            interactive={interactive}
          />
        ))}
      {showUserListDrawer ? (
        <View style={styles.imageExtraRoot}>
          <ProfilePicture
            profile={users[limit - 1]}
            style={profilePictureStyles}
            navigationType={navigationType}
            interactive={interactive}
          />
          <View
            style={[
              styles.imageExtraDim,
              { marginLeft: spacing(2.5) - imageWidth }
            ]}
          />
          <Text
            style={[
              styles.imageCount,
              { width: imageWidth, marginLeft: spacing(0.5) - imageWidth }
            ]}
          >
            {`+${formatCount(remainingUsersCount)}`}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
