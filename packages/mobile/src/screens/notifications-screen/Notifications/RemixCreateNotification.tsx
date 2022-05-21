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

import {
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  EntityLink,
  UserNameLink
} from '../Notification'

const messages = {
  title: 'New remix of your track',
  by: 'by'
}

type RemixCreateNotificationProps = {
  notification: RemixCreate
}

export const RemixCreateNotification = (
  props: RemixCreateNotificationProps
) => {
  const { notification } = props
  const user = useSelectorWeb(state => getNotificationUser(state, notification))
  const entities = useSelectorWeb(
    state => getNotificationEntities(state, notification),
    isEqual
  )

  const entity = entities.find(
    track => track.track_id === notification.childTrackId
  ) as TrackEntity

  if (!user || !entity) return null

  return (
    <NotificationTile notification={notification}>
      <NotificationHeader icon={IconRemix}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationText>
        <EntityLink entity={entity} /> {messages.by}{' '}
        <UserNameLink user={user} />
      </NotificationText>
    </NotificationTile>
  )
}
