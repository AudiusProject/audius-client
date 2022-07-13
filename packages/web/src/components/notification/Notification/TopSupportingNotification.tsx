import { useCallback } from 'react'

import { ReactComponent as IconTrending } from 'assets/img/iconTrending.svg'
import { Name } from 'common/models/Analytics'
import { SupportingRankUp } from 'common/store/notifications/types'
import { make } from 'store/analytics/actions'

import styles from './TopSupportingNotification.module.css'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { ProfilePicture } from './components/ProfilePicture'
import { TwitterShareButton } from './components/TwitterShareButton'
import { UserNameLink } from './components/UserNameLink'
import { IconTip } from './components/icons'
import { useGoToProfile } from './useGoToProfile'

const messages = {
  title: 'Top Supporter',
  supporterChange: "You're now their",
  supporter: 'Top Supporter',
  twitterShare: (handle: string, rank: number) =>
    `I'm now ${handle}'s #${rank} Top Supporter on @AudiusProject #Audius $AUDIO  #AUDIOTip`
}

type TopSupportingNotificationProps = {
  notification: SupportingRankUp
}

export const TopSupportingNotification = (
  props: TopSupportingNotificationProps
) => {
  const { notification } = props
  const { user, rank, timeLabel, isViewed } = notification

  const handleClick = useGoToProfile(user)

  const handleTwitterShare = useCallback(
    (handle: string) => {
      const shareText = messages.twitterShare(handle, rank)
      const analytics = make(
        Name.NOTIFICATIONS_CLICK_SUPPORTING_RANK_UP_TWITTER_SHARE,
        {
          text: shareText
        }
      )

      return { shareText, analytics }
    },
    [rank]
  )

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconTip />}>
        <NotificationTitle>
          #{rank} {messages.title}
        </NotificationTitle>
      </NotificationHeader>
      <NotificationBody className={styles.body}>
        <div className={styles.bodyUser}>
          <ProfilePicture className={styles.profilePicture} user={user} />
          <UserNameLink
            className={styles.userNameLink}
            user={user}
            notification={notification}
          />
        </div>
        <span className={styles.trending}>
          <IconTrending className={styles.trendingIcon} />
          {messages.supporterChange} #{rank} {messages.supporter}
        </span>
      </NotificationBody>
      <TwitterShareButton
        type='dynamic'
        handle={user.handle}
        shareData={handleTwitterShare}
      />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
