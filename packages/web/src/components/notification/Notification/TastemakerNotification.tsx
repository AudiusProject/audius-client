import { useCallback } from 'react'

import {
  Name,
  Nullable,
  notificationsSelectors,
  TrackEntity,
  TastemakerNotification as TastemakerNotificationType,
  EntityType
} from '@audius/common'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { make } from 'common/store/analytics/actions'
import { useSelector } from 'utils/reducer'

import { EntityLink } from './components/EntityLink'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { TwitterShareButton } from './components/TwitterShareButton'
import { IconTrending } from './components/icons'
import { getEntityLink } from './utils'
const { getNotificationEntity, getNotificationUser } = notificationsSelectors

const messages = {
  title: 'You’re a Taste Maker!',
  is: 'is',
  tastemaker: 'now trending thanks to you! Great work 🙌',
  twitterShare: (trackOwnerHandle: string, trackTitle: string) => {
    return `I was one of the first to discover ${trackTitle} by ${trackOwnerHandle} on @AudiusProject and it just made it onto trending! #Audius #AudiusTastemaker`
  }
}

type TastemakerNotificationProps = {
  notification: TastemakerNotificationType
}

export const TastemakerNotification = (props: TastemakerNotificationProps) => {
  const { notification } = props
  const { entityType, timeLabel, isViewed } = notification
  const dispatch = useDispatch()
  const track = useSelector((state) =>
    getNotificationEntity(state, notification)
  ) as Nullable<TrackEntity>
  const trackOwnerUser = useSelector((state) =>
    getNotificationUser(state, notification)
  )
  console.log('making notification ')
  console.log('notification issss ', notification)
  console.log('track isss ', track)
  console.log('track owner user isss ', trackOwnerUser)

  const handleClick = useCallback(() => {
    if (track) {
      dispatch(push(getEntityLink(track)))
    }
  }, [dispatch, track])

  // to do - add mobile version as well
  const handleShare = useCallback(
    (trackOwnerHandle: string) => {
      const trackTitle = track?.title || ''
      const shareText = messages.twitterShare(trackOwnerHandle, trackTitle)
      const analytics = make(
        Name.NOTIFICATIONS_CLICK_TASTEMAKER_TWITTER_SHARE,
        {
          text: shareText
        }
      )
      return { shareText: track ? shareText : '', analytics }
    },
    [track]
  )

  // problem - this is returning before we have time to select user and track info
  // if (!track || !trackOwnerUser) return null

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconTrending />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody>
        <EntityLink entity={track} entityType={entityType} /> {messages.is}{' '}
        {messages.tastemaker}
      </NotificationBody>
      <TwitterShareButton
        type='dynamic'
        handle={'trackOwnerUser.handle'}
        shareData={handleShare}
      />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
