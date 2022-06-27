import { useCallback } from 'react'

import {
  getNotificationEntities,
  getNotificationUser
} from 'audius-client/src/common/store/notifications/selectors'
import {
  Entity,
  UserSubscription
} from 'audius-client/src/common/store/notifications/types'
import { isEqual } from 'lodash'
import { View } from 'react-native'

import IconStars from 'app/assets/images/iconStars.svg'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'

import {
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  EntityLink,
  UserNameLink,
  ProfilePicture
} from '../Notification'

const messages = {
  title: 'New Release',
  posted: 'posted',
  new: 'new'
}

type UserSubscriptionNotificationProps = {
  notification: UserSubscription
}

export const UserSubscriptionNotification = (
  props: UserSubscriptionNotificationProps
) => {
  const { notification } = props
  const { entityType } = notification
  const navigation = useNavigation()
  const user = useSelectorWeb((state) =>
    getNotificationUser(state, notification)
  )
  const entities = useSelectorWeb(
    (state) => getNotificationEntities(state, notification),
    isEqual
  )

  const handleClick = useCallback(() => {
    if (entityType === Entity.Track && !isSingleUpload) {
      if (user) {
        dispatch(push(profilePage(user.handle)))
      }
    } else {
      if (entities) {
        const entityLink = getEntityLink(entities[0])
        dispatch(push(entityLink))
        record(
          make(Name.NOTIFICATIONS_CLICK_TILE, {
            kind: type,
            link_to: entityLink
          })
        )
      }
    }
  }, [entityType, isSingleUpload, user, entities, dispatch, record, type])

  if (!user || !entities) return null

  const uploadCount = entities.length
  const isSingleUpload = uploadCount === 1

  return (
    <NotificationTile notification={notification}>
      <NotificationHeader icon={IconStars}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ProfilePicture profile={user} />
        <View style={{ flex: 1 }}>
          <NotificationText>
            <UserNameLink user={user} /> {messages.posted}{' '}
            {isSingleUpload ? 'a' : uploadCount} {messages.new}{' '}
            {entityType.toLowerCase()}
            {isSingleUpload ? '' : 's'}{' '}
            {isSingleUpload ? <EntityLink entity={entities[0]} /> : null}
          </NotificationText>
        </View>
      </View>
    </NotificationTile>
  )
}
