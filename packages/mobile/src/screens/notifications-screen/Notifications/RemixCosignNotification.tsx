import { useCallback } from 'react'

import type {
  Nullable,
  RemixCosignNotification as RemixCosignNotificationType,
  TrackEntity
} from '@audius/common'
import { useProxySelector, notificationsSelectors } from '@audius/common'
import { View } from 'react-native'
import { useSelector } from 'react-redux'

import IconRemix from 'app/assets/images/iconRemix.svg'
import { make } from 'app/services/analytics'
import { EventNames } from 'app/types/analytics'
import { getTrackRoute } from 'app/utils/routes'

import { useNotificationNavigation } from '../../app-drawer-screen'
import {
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  EntityLink,
  UserNameLink,
  ProfilePicture,
  NotificationTwitterButton
} from '../Notification'
const { getNotificationEntities, getNotificationUser } = notificationsSelectors

const messages = {
  title: 'Remix Co-sign',
  cosign: 'Co-signed your Remix of',
  shareTwitterText: (trackTitle: string, handle: string) =>
    `My remix of ${trackTitle} was Co-Signed by ${handle} on @AudiusProject #Audius`
}

type RemixCosignNotificationProps = {
  notification: RemixCosignNotificationType
}

export const RemixCosignNotification = (
  props: RemixCosignNotificationProps
) => {
  const { notification } = props
  const navigation = useNotificationNavigation()
  const { childTrackId, parentTrackUserId } = notification
  const user = useSelector((state) => getNotificationUser(state, notification))
  // TODO: casting from EntityType to TrackEntity here, but
  // getNotificationEntities should be smart enough based on notif type
  const tracks = useProxySelector(
    (state) => getNotificationEntities(state, notification),
    [notification]
  ) as Nullable<TrackEntity[]>

  const childTrack = tracks?.find(({ track_id }) => track_id === childTrackId)
  const parentTrack = tracks?.find(
    ({ owner_id }) => owner_id === parentTrackUserId
  )
  const parentTrackTitle = parentTrack?.title

  const handlePress = useCallback(() => {
    if (childTrack) {
      navigation.navigate('Track', {
        id: childTrack.track_id,
        fromNotifications: true
      })
    }
  }, [childTrack, navigation])

  const handleTwitterShareData = useCallback(
    (handle: string | undefined) => {
      if (parentTrackTitle && handle) {
        const shareText = messages.shareTwitterText(parentTrackTitle, handle)
        const analytics = make({
          eventName: EventNames.NOTIFICATIONS_CLICK_REMIX_COSIGN_TWITTER_SHARE,
          text: shareText
        })
        return { shareText, analytics }
      }
      return null
    },
    [parentTrackTitle]
  )

  if (!user || !childTrack || !parentTrack) return null

  const twitterUrl = getTrackRoute(childTrack, true)

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconRemix}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ProfilePicture profile={user} />
        <View style={{ flex: 1 }}>
          <NotificationText>
            <UserNameLink user={user} /> {messages.cosign}{' '}
            <EntityLink entity={parentTrack} />
          </NotificationText>
        </View>
      </View>
      <NotificationTwitterButton
        type='dynamic'
        url={twitterUrl}
        handle={user.handle}
        shareData={handleTwitterShareData}
      />
    </NotificationTile>
  )
}
