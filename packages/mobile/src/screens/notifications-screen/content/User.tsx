import { useCallback, useContext } from 'react'

import { User as UserType } from 'audius-client/src/common/models/User'
import { NOTIFICATION_PAGE } from 'audius-client/src/utils/route'
import { StyleSheet, Text } from 'react-native'
import { useDispatch } from 'react-redux'

import { useNavigation } from 'app/hooks/useNavigation'
import { NotificationsDrawerNavigationContext } from 'app/screens/notifications-screen/NotificationsDrawerNavigationContext'
import { close } from 'app/store/notifications/actions'
import { getUserRoute } from 'app/utils/routes'
import { useTheme } from 'app/utils/theme'

const styles = StyleSheet.create({
  text: {
    fontFamily: 'AvenirNextLTPro-Bold',
    fontSize: 16
  }
})

type UserProps = {
  user: UserType
}

const User = ({ user }: UserProps) => {
  const dispatch = useDispatch()
  const { drawerHelpers } = useContext(NotificationsDrawerNavigationContext)
  const navigation = useNavigation({ customNativeNavigation: drawerHelpers })

  const onPress = useCallback(() => {
    navigation.navigate({
      native: {
        screen: 'Profile',
        params: { handle: user.handle, fromNotifications: true }
      },
      web: { route: getUserRoute(user), fromPage: NOTIFICATION_PAGE }
    })
    dispatch(close())
  }, [user, navigation, dispatch])

  const textStyle = useTheme(styles.text, {
    color: 'secondary'
  })

  return (
    <Text style={textStyle} onPress={onPress}>
      {user.name}
    </Text>
  )
}

export default User
