import {
  Notification,
  NotificationType
} from 'audius-client/src/common/store/notifications/types'

import {
  FavoriteNotification,
  FollowNotification,
  RepostNotification,
  ChallengeRewardNotification,
  RemixCreateNotification
} from './Notifications'

type NotificationListItemProps = {
  notification: Notification
}
export const NotificationListItem = (props: NotificationListItemProps) => {
  const { notification } = props
  switch (notification.type) {
    case NotificationType.Favorite:
      return <FavoriteNotification notification={notification} />
    case NotificationType.Follow:
      return <FollowNotification notification={notification} />
    case NotificationType.Repost:
      return <RepostNotification notification={notification} />
    case NotificationType.ChallengeReward:
      return <ChallengeRewardNotification notification={notification} />
    case NotificationType.RemixCreate:
      return <RemixCreateNotification notification={notification} />
    default:
      return null
  }
}
