import { useCallback } from 'react'

import type {
  User,
  Nullable,
  FavoriteNotification,
  FollowNotification,
  RepostNotification
} from '@audius/common'
import { notificationsUserListActions } from '@audius/common'
import { useDispatch } from 'react-redux'

import { useAppDrawerNavigation } from '../../app-drawer-screen'
const { setNotificationId } = notificationsUserListActions

/**
 * onPress handler for social notifications that opens user-lists when notification
 * has multiple users, and opens user profile when just one.
 */
export const useSocialActionHandler = (
  notification: FollowNotification | RepostNotification | FavoriteNotification,
  users: Nullable<User[]>
) => {
  const { id, type, userIds } = notification
  const firstUser = users?.[0]
  const isMultiUser = userIds.length > 1
  const dispatch = useDispatch()
  const navigation = useAppDrawerNavigation()

  return useCallback(() => {
    if (isMultiUser) {
      dispatch(setNotificationId(id))
      navigation.navigate('NotificationUsers', {
        id,
        notificationType: type,
        count: userIds.length,
        fromNotifications: true
      })
    } else if (firstUser) {
      navigation.navigate('Profile', {
        handle: firstUser.handle,
        fromNotifications: true
      })
    }
  }, [isMultiUser, id, type, userIds, dispatch, navigation, firstUser])
}
