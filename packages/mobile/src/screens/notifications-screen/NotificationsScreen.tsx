import { useCallback } from 'react'

import { notificationsActions } from '@audius/common'
import { useFocusEffect } from '@react-navigation/native'
import { useDispatch } from 'react-redux'

import IconNotification from 'app/assets/images/iconNotification.svg'
import { Screen, ScreenContent, ScreenHeader } from 'app/components/core'
import { useAppTabScreen } from 'app/hooks/useAppTabScreen'

import { NotificationList } from './NotificationList'
const { markAllAsViewed } = notificationsActions

const messages = {
  header: 'Notifications'
}

export const NotificationsScreen = () => {
  useAppTabScreen()
  const dispatch = useDispatch()

  useFocusEffect(
    useCallback(() => {
      dispatch(markAllAsViewed())
    }, [dispatch])
  )

  return (
    <Screen>
      <ScreenHeader
        text={messages.header}
        icon={IconNotification}
        iconProps={{ height: 28, width: 28 }}
        styles={{ icon: { marginLeft: -1 } }}
      />
      <ScreenContent>
        <NotificationList />
      </ScreenContent>
    </Screen>
  )
}
