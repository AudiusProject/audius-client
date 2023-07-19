import { useCallback } from 'react'

import type {
  Nullable,
  USDCPurchaseSellerNotification as USDCPurchaseSellerNotificationType,
  TrackEntity
} from '@audius/common'
import {
  formatNumberCommas,
  notificationsSelectors,
  EntityLink
} from '@audius/common'
import { useSelector } from 'react-redux'

import IconTastemaker from 'app/assets/images/iconTastemaker.svg'
import { useNotificationNavigation } from 'app/hooks/useNotificationNavigation'

import {
  NotificationTile,
  NotificationHeader,
  NotificationText,
  NotificationTitle
} from '../Notification'

const { getNotificationUser, getNotificationEntity } = notificationsSelectors

const messages = {
  title: 'Track Sold',
  congrats: 'Congrats, ',
  justBoughtYourTrack: ' just bought your track ',
  for: ' for ',
  exclamation: '!'
}

type USDCPurchaseSellerNotificationProps = {
  notification: USDCPurchaseSellerNotificationType
}

export const USDCPurchaseSellerNotification = (
  props: USDCPurchaseSellerNotificationProps
) => {
  const { notification } = props
  const navigation = useNotificationNavigation()
  const track = useSelector((state) =>
    getNotificationEntity(state, notification)
  ) as Nullable<TrackEntity>
  const buyerUser = useSelector((state) =>
    getNotificationUser(state, notification)
  )
  const { amount } = notification

  const handlePress = useCallback(() => {
    if (track) {
      navigation.navigate(notification)
    }
  }, [track, navigation, notification])

  if (!track || !buyerUser) return null
  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconTastemaker}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationText>
        {messages.congrats} <EntityLink entity={buyerUser} />{' '}
        {messages.justBoughtYourTrack} ${track.title} for ${amount}{' '}
        {messages.exclamation}
      </NotificationText>
    </NotificationTile>
  )
}
