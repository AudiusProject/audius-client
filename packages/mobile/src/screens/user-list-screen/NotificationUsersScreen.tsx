import { useCallback } from 'react'

import { NotificationType } from 'audius-client/src/common/store/notifications/types'
import { getUserList } from 'audius-client/src/common/store/user-list/notifications/selectors'

import { useRoute } from 'app/hooks/useRoute'
import { formatCount } from 'app/utils/format'

import { UserList } from './UserList'
import { UserListScreen } from './UserListScreen'

export const NotificationUsersScreen = () => {
  const { params } = useRoute<'NotificationUsersScreen'>()
  const { notificationType, count } = params

  const getTitle = useCallback(() => {
    if (notificationType === NotificationType.Follow) {
      return `${formatCount(count)} new followers`
    }
    return `${formatCount(count)} ${notificationType.toLowerCase()}s`
  }, [notificationType, count])

  return (
    <UserListScreen title={getTitle()}>
      <UserList userSelector={getUserList} tag='NOTIFICATION_USERS_SCREEN' />
    </UserListScreen>
  )
}
