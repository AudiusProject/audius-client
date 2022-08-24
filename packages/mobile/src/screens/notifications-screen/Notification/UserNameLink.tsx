import { useCallback, useContext } from 'react'

import type { User as UserType } from '@audius/common'
import { NOTIFICATION_PAGE } from 'audius-client/src/utils/route'
import { useDispatch } from 'react-redux'

import type { TextProps } from 'app/components/core'
import { Text } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { NotificationsDrawerNavigationContext } from 'app/screens/notifications-screen/NotificationsDrawerNavigationContext'
import { close } from 'app/store/notifications/slice'
import { getUserRoute } from 'app/utils/routes'

type UserNameLinkProps = TextProps & {
  user: UserType
}

export const UserNameLink = (props: UserNameLinkProps) => {
  const { user, ...other } = props
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

  return (
    <Text
      fontSize='large'
      weight='medium'
      color='secondary'
      onPress={onPress}
      {...other}
    >
      {user.name}
    </Text>
  )
}
