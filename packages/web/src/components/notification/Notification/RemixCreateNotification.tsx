import { useCallback } from 'react'

import {
  Name,
  Nullable,
  notificationsSelectors,
  RemixCreateNotification as RemixCreateNotificationType,
  TrackEntity
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
import { UserNameLink } from './components/UserNameLink'
import { IconRemix } from './components/icons'
import { getEntityLink } from './utils'
const { getNotificationEntities, getNotificationUser } = notificationsSelectors

const messages = {
  title: 'New remix of your track',
  by: 'by',
  shareTwitterText: (track: TrackEntity, handle: string) =>
    `New remix of ${track.title} by ${handle} on @AudiusProject #Audius`
}

type RemixCreateNotificationProps = {
  notification: RemixCreateNotificationType
}

export const RemixCreateNotification = (
  props: RemixCreateNotificationProps
) => {
  const { notification } = props
  const { entityType, timeLabel, isViewed, childTrackId, parentTrackId } =
    notification
  const dispatch = useDispatch()
  const user = useSelector((state) => getNotificationUser(state, notification))

  // TODO: casting from EntityType to TrackEntity here, but
  // getNotificationEntities should be smart enough based on notif type
  const tracks = useSelector((state) =>
    getNotificationEntities(state, notification)
  ) as Nullable<TrackEntity[]>

  const childTrack = tracks?.find((track) => track.track_id === childTrackId)

  const parentTrack = tracks?.find((track) => track.track_id === parentTrackId)

  const handleClick = useCallback(() => {
    if (childTrack) {
      dispatch(push(getEntityLink(childTrack)))
    }
  }, [childTrack, dispatch])

  const handleShare = useCallback(
    (twitterHandle: string) => {
      if (!parentTrack) return null
      const shareText = messages.shareTwitterText(parentTrack, twitterHandle)
      const analytics = make(
        Name.NOTIFICATIONS_CLICK_REMIX_CREATE_TWITTER_SHARE,
        { text: shareText }
      )
      return { shareText, analytics }
    },
    [parentTrack]
  )

  if (!user || !parentTrack || !childTrack) return null

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconRemix />}>
        <NotificationTitle>
          {messages.title}{' '}
          <EntityLink entity={parentTrack} entityType={entityType} />
        </NotificationTitle>
      </NotificationHeader>
      <NotificationBody>
        <EntityLink entity={childTrack} entityType={entityType} /> {messages.by}{' '}
        <UserNameLink user={user} notification={notification} />
      </NotificationBody>
      <TwitterShareButton
        type='dynamic'
        handle={user.handle}
        url={getEntityLink(parentTrack, true)}
        shareData={handleShare}
      />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
