import type { FavoriteNotification as FavoriteNotificationType } from '@audius/common'
import { formatCount, notificationsSelectors } from '@audius/common'

import IconHeart from 'app/assets/images/iconHeart.svg'
import { useProxySelector } from 'app/hooks/useProxySelector'

import {
  NotificationHeader,
  NotificationTile,
  ProfilePictureList,
  UserNameLink,
  USER_LENGTH_LIMIT,
  NotificationText,
  EntityLink
} from '../Notification'

import { useSocialActionHandler } from './useSocialActionHandler'
const { getNotificationEntity, getNotificationUsers } = notificationsSelectors

const messages = {
  others: (userCount: number) =>
    ` and ${formatCount(userCount)} other${userCount > 1 ? 's' : ''}`,
  favorited: ' favorited your'
}

type FavoriteNotificationProps = {
  notification: FavoriteNotificationType
}

export const FavoriteNotification = (props: FavoriteNotificationProps) => {
  const { notification } = props
  const { id, userIds, entityType } = notification

  if (id === 'f181a99b-b3d8-4607-b874-8a7e95c9284e') {
    console.log('favorite notif')
  }
  const users = useProxySelector(
    (state) => getNotificationUsers(state, notification, USER_LENGTH_LIMIT),
    [notification]
  )

  const firstUser = users?.[0]
  const otherUsersCount = userIds.length - 1

  const entity = useProxySelector(
    (state) => getNotificationEntity(state, notification),
    [notification]
  )

  const handlePress = useSocialActionHandler(notification, users)

  if (!users || !firstUser || !entity) return null

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconHeart}>
        <ProfilePictureList users={users} />
      </NotificationHeader>
      <NotificationText>
        <UserNameLink user={firstUser} />
        {otherUsersCount > 0 ? messages.others(otherUsersCount) : null}
        {messages.favorited} {entityType.toLowerCase()}{' '}
        <EntityLink entity={entity} />
      </NotificationText>
    </NotificationTile>
  )
}
