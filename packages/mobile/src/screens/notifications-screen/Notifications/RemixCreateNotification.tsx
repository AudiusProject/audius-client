import { useCallback } from 'react'

import {
  getNotificationEntities,
  getNotificationUser
} from 'audius-client/src/common/store/notifications/selectors'
import {
  RemixCreate,
  TrackEntity
} from 'audius-client/src/common/store/notifications/types'
import { isEqual } from 'lodash'

import IconRemix from 'app/assets/images/iconRemix.svg'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { getTrackRoute } from 'app/utils/routes'

import {
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  EntityLink,
  UserNameLink
} from '../Notification'
import { useDrawerNavigation } from '../useDrawerNavigation'

const messages = {
  title: 'New Remix of Your Track',
  by: 'by'
}

type RemixCreateNotificationProps = {
  notification: RemixCreate
}

export const RemixCreateNotification = (
  props: RemixCreateNotificationProps
) => {
  const { notification } = props
  const navigation = useDrawerNavigation()
  const user = useSelectorWeb(state => getNotificationUser(state, notification))
  const tracks = useSelectorWeb(
    state => getNotificationEntities(state, notification),
    isEqual
  )

  const track = tracks.find(
    track => track.track_id === notification.childTrackId
  ) as TrackEntity

  const handlePress = useCallback(() => {
    if (track) {
      navigation.navigate({
        native: {
          screen: 'Track',
          params: { id: track.track_id, fromNotifications: true }
        },
        web: {
          route: getTrackRoute(track)
        }
      })
    }
  }, [track, navigation])

  if (!user || !track) return null

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconRemix}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationText>
        <EntityLink entity={track} /> {messages.by} <UserNameLink user={user} />
      </NotificationText>
    </NotificationTile>
  )
}
