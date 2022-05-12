import React, { useCallback } from 'react'

import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { Name } from 'common/models/Analytics'
import { RemixCosign, TrackEntity } from 'common/store/notifications/types'
import { make, useRecord } from 'store/analytics/actions'
import { openTwitterLink } from 'utils/tweet'

import { EntityLink } from './EntityLink'
import { NotificationBody } from './NotificationBody'
import { NotificationFooter } from './NotificationFooter'
import { NotificationHeader } from './NotificationHeader'
import { NotificationTile } from './NotificationTile'
import { NotificationTitle } from './NotificationTitle'
import { TrackContent } from './TrackContent'
import { TwitterShareButton } from './TwitterShareButton'
import { UserNameLink } from './UserNameLink'
import { IconRemix } from './icons'
import { getTwitterHandleByUserHandle, getEntityLink } from './utils'

const messages = {
  title: 'Remix Co-sign',
  cosign: 'Co-signed your Remix of',
  shareTwitterText: (track: TrackEntity, handle: string) =>
    `My remix of ${track.title} was Co-Signed by ${handle} on @AudiusProject #Audius`
}

type RemixCosignNotificationProps = {
  notification: RemixCosign
}

export const RemixCosignNotification = (
  props: RemixCosignNotificationProps
) => {
  const { notification } = props
  const {
    user,
    entities,
    entityType,
    timeLabel,
    isRead,
    childTrackId
  } = notification
  const dispatch = useDispatch()
  const record = useRecord()

  const childTrack = entities.find(
    track => track.track_id === childTrackId
  ) as TrackEntity

  const parentTrack = entities.find(
    track => track.track_id === childTrackId
  ) as TrackEntity

  const handleClick = useCallback(() => {
    dispatch(push(getEntityLink(childTrack)))
  }, [childTrack, dispatch])

  const handleTwitterShare = useCallback(async () => {
    let twitterHandle = await getTwitterHandleByUserHandle(user.handle)
    if (!twitterHandle) twitterHandle = user.name
    else twitterHandle = `@${twitterHandle}`

    const shareText = messages.shareTwitterText(parentTrack, twitterHandle)

    openTwitterLink(getEntityLink(childTrack, true), shareText)
    record(
      make(Name.NOTIFICATIONS_CLICK_REMIX_COSIGN_TWITTER_SHARE, {
        text: shareText
      })
    )
  }, [user, parentTrack, childTrack, record])

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconRemix />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody>
        <UserNameLink user={user} notification={notification} />{' '}
        {messages.cosign}{' '}
        <EntityLink entity={childTrack} entityType={entityType} />
      </NotificationBody>
      <div>
        <TrackContent track={childTrack} />
      </div>
      <TwitterShareButton onClick={handleTwitterShare} />
      <NotificationFooter timeLabel={timeLabel} isRead={isRead} />
    </NotificationTile>
  )
}
