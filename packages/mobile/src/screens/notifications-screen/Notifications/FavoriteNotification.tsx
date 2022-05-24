import {
  getNotificationEntity,
  getNotificationUsers
} from 'audius-client/src/common/store/notifications/selectors'
import { Favorite } from 'common/store/notifications/types'
import { formatCount } from 'common/utils/formatUtil'
import { isEqual } from 'lodash'

import IconHeart from 'app/assets/images/iconHeart.svg'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

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

const messages = {
  others: (userCount: number) =>
    ` and ${formatCount(userCount)} other${userCount > 1 ? 's' : ''}`,
  favorited: ' favorited your'
}

type FavoriteNotificationProps = {
  notification: Favorite
}

export const FavoriteNotification = (props: FavoriteNotificationProps) => {
  const { notification } = props
  const { userIds, entityType } = notification
  const users = useSelectorWeb(
    state => getNotificationUsers(state, notification, USER_LENGTH_LIMIT),
    isEqual
  )
  const [firstUser] = users
  const otherUsersCount = userIds.length - 1

  const entity = useSelectorWeb(
    state => getNotificationEntity(state, notification),
    isEqual
  )

  const handlePress = useSocialActionHandler(notification, users)

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
