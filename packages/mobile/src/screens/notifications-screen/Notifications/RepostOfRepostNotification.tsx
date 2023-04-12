import { useCallback } from 'react'

import type { RepostOfRepostNotification as RepostOfRepostNotificationType } from '@audius/common'
import {
  useProxySelector,
  formatCount,
  notificationsSelectors,
  Entity
} from '@audius/common'

import IconRepost from 'app/assets/images/iconRepost.svg'
import { useNotificationNavigation } from 'app/hooks/useNotificationNavigation'

import {
  NotificationHeader,
  NotificationTile,
  ProfilePictureList,
  UserNameLink,
  USER_LENGTH_LIMIT,
  NotificationText,
  EntityLink
} from '../Notification'

const { getNotificationEntity, getNotificationUsers } = notificationsSelectors

const messages = {
  others: (userCount: number) =>
    ` and ${formatCount(userCount)} other${userCount > 1 ? 's' : ''}`,
  reposted: ' reposted your repost of'
}

type RepostOfRepostNotificationProps = {
  notification: RepostOfRepostNotificationType
}

export const RepostOfRepostNotification = (
  props: RepostOfRepostNotificationProps
) => {
  const { notification } = props
  const { userIds, entityType } = notification
  const navigation = useNotificationNavigation()

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

  const entityTypeText =
    entity && 'is_album' in entity && entity.is_album
      ? Entity.Album
      : entityType

  const handlePress = useCallback(() => {
    navigation.navigate(notification)
  }, [navigation, notification])

  if (!users || !firstUser || !entity) return null

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconRepost}>
        <ProfilePictureList users={users} />
      </NotificationHeader>
      <NotificationText>
        <UserNameLink user={firstUser} />
        {otherUsersCount > 0 ? messages.others(otherUsersCount) : null}
        {messages.reposted} {entityTypeText.toLowerCase()}{' '}
        <EntityLink entity={entity} />
      </NotificationText>
    </NotificationTile>
  )
}
