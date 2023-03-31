import { Notification as Notifications, NotificationType } from '@audius/common'

import ErrorWrapper from 'components/error-wrapper/ErrorWrapper'

import { AddTrackToPlaylistNotification } from './AddTrackToPlaylistNotification'
import { AnnouncementNotification } from './AnnouncementNotification'
import { ChallengeRewardNotification } from './ChallengeRewardNotification'
import { FavoriteNotification } from './FavoriteNotification'
import { FavoriteOfRepostNotification } from './FavoriteOfRepostNotification'
import { FollowNotification } from './FollowNotification'
import { MilestoneNotification } from './MilestoneNotification'
import { RemixCosignNotification } from './RemixCosignNotification'
import { RemixCreateNotification } from './RemixCreateNotification'
import { RepostNotification } from './RepostNotification'
import { RepostOfRepostNotification } from './RepostOfRepostNotification'
import { SupporterDethronedNotification } from './SupporterDethronedNotification'
import { TastemakerNotification } from './TastemakerNotification'
import { TierChangeNotification } from './TierChangeNotification'
import { TipReactionNotification } from './TipReactionNotification'
import { TipReceivedNotification } from './TipReceivedNotification'
import { TipSentNotification } from './TipSentNotification'
import { TopSupporterNotification } from './TopSupporterNotification'
import { TopSupportingNotification } from './TopSupportingNotification'
import { TrendingPlaylistNotification } from './TrendingPlaylistNotification'
import { TrendingTrackNotification } from './TrendingTrackNotification'
import { TrendingUndergroundNotification } from './TrendingUndergroundNotification'
import { UserSubscriptionNotification } from './UserSubscriptionNotification'

type NotificationProps = {
  notification: Notifications
}

export const Notification = (props: NotificationProps) => {
  const { notification } = props

  const getNotificationElement = () => {
    switch (notification.type) {
      case NotificationType.Announcement: {
        return <AnnouncementNotification notification={notification} />
      }
      case NotificationType.ChallengeReward: {
        return <ChallengeRewardNotification notification={notification} />
      }
      case NotificationType.Favorite: {
        return <FavoriteNotification notification={notification} />
      }
      case NotificationType.Follow: {
        return <FollowNotification notification={notification} />
      }
      case NotificationType.Milestone: {
        return <MilestoneNotification notification={notification} />
      }
      case NotificationType.RemixCosign: {
        return <RemixCosignNotification notification={notification} />
      }
      case NotificationType.RemixCreate: {
        return <RemixCreateNotification notification={notification} />
      }
      case NotificationType.Repost: {
        return <RepostNotification notification={notification} />
      }
      case NotificationType.RepostOfRepost: {
        return <RepostOfRepostNotification notification={notification} />
      }
      case NotificationType.Tastemaker: {
        return <TastemakerNotification notification={notification} />
      }
      case NotificationType.FavoriteOfRepost: {
        return <FavoriteOfRepostNotification notification={notification} />
      }
      case NotificationType.TierChange: {
        return <TierChangeNotification notification={notification} />
      }
      case NotificationType.Reaction: {
        return <TipReactionNotification notification={notification} />
      }
      case NotificationType.TipReceive: {
        return <TipReceivedNotification notification={notification} />
      }
      case NotificationType.TipSend: {
        return <TipSentNotification notification={notification} />
      }
      case NotificationType.SupporterRankUp: {
        return <TopSupporterNotification notification={notification} />
      }
      case NotificationType.SupportingRankUp: {
        return <TopSupportingNotification notification={notification} />
      }
      case NotificationType.TrendingPlaylist: {
        return <TrendingPlaylistNotification notification={notification} />
      }
      case NotificationType.TrendingTrack: {
        return <TrendingTrackNotification notification={notification} />
      }
      case NotificationType.TrendingUnderground: {
        return <TrendingUndergroundNotification notification={notification} />
      }
      case NotificationType.UserSubscription: {
        return <UserSubscriptionNotification notification={notification} />
      }
      case NotificationType.AddTrackToPlaylist: {
        return <AddTrackToPlaylistNotification notification={notification} />
      }

      case NotificationType.SupporterDethroned: {
        return <SupporterDethronedNotification notification={notification} />
      }
      default: {
        return null
      }
    }
  }
  return (
    <ErrorWrapper
      errorMessage={`Could not render notification ${notification.id}`}
    >
      {getNotificationElement()}
    </ErrorWrapper>
  )
}
