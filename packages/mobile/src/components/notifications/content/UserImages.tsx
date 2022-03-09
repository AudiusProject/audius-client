import { useCallback } from 'react'

import { SquareSizes } from 'audius-client/src/common/models/ImageSizes'
import { User } from 'audius-client/src/common/models/User'
import { ConnectedNotification } from 'audius-client/src/common/store/notifications/types'
import { NOTIFICATION_PAGE } from 'audius-client/src/utils/route'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { useNavigation } from 'app/hooks/useNavigation'
import { useUserProfilePicture } from 'app/hooks/useUserProfilePicture'
import { close } from 'app/store/notifications/actions'
import { getUserRoute } from 'app/utils/routes'
import { useTheme } from 'app/utils/theme'

import { getUserListRoute } from '../routeUtil'

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'flex-start'
  },
  container: {
    marginBottom: 8,
    flexDirection: 'row'
  },
  image: {
    height: 32,
    width: 32,
    borderRadius: 16,
    marginRight: 4
  }
})

type UserImagesProps = {
  notification: ConnectedNotification
  users: User[]
}

const UserImage = ({
  user,
  allowPress = true
}: {
  user: User
  allowPress?: boolean
}) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()

  const handlePress = useCallback(() => {
    navigation.navigate({
      native: { screen: 'Profile', params: { handle: user.handle } },
      web: { route: getUserRoute(user), fromPage: NOTIFICATION_PAGE }
    })
    dispatch(close())
  }, [navigation, user, dispatch])

  const profilePicture = useUserProfilePicture(
    user?.user_id,
    user?._profile_picture_sizes,
    SquareSizes.SIZE_150_BY_150
  )

  const imageStyle = useTheme(styles.image, {
    backgroundColor: 'neutralLight4'
  })
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={allowPress ? handlePress : undefined}
      key={user.user_id}
    >
      <Image style={imageStyle} source={{ uri: profilePicture }} />
    </TouchableOpacity>
  )
}

const UserImages = ({ notification, users }: UserImagesProps) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()

  const isMultiUser = users.length > 1

  const handlePress = useCallback(() => {
    navigation.navigate({
      native: {
        screen: 'NotificationUsers',
        params: { notificationType: notification.type, count: users.length }
      },
      web: {
        route: getUserListRoute(notification),
        fromPage: NOTIFICATION_PAGE
      }
    })
    dispatch(close())
  }, [navigation, notification, dispatch, users.length])

  const renderUsers = () => (
    <View style={styles.container}>
      {users.map(user => {
        return (
          <UserImage allowPress={!isMultiUser} user={user} key={user.user_id} />
        )
      })}
    </View>
  )

  return isMultiUser ? (
    <TouchableOpacity
      style={styles.touchable}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {renderUsers()}
    </TouchableOpacity>
  ) : (
    renderUsers()
  )
}

export default UserImages
