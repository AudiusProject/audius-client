import { useCallback } from 'react'

import type {
  Nullable,
  USDCPurchaseSellerNotification as USDCPurchaseSellerNotificationType,
  TrackEntity
} from '@audius/common'
import {
  Entity,
  formatNumberCommas,
  notificationsSelectors
} from '@audius/common'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { useSelector } from 'utils/reducer'

import { EntityLink } from './components/EntityLink'
import { NotificationBody } from './components/NotificationBody'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { IconTastemaker } from './components/icons'
import { getEntityLink } from './utils'

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
  console.log(notification)
  const dispatch = useDispatch()
  const track = useSelector((state) =>
    getNotificationEntity(state, notification)
  ) as Nullable<TrackEntity>
  console.log('im checking trackkkk')
  console.log('track is???? ', track)
  const buyerUser = useSelector((state) =>
    getNotificationUser(state, notification)
  )
  const { amount } = notification
  const handleClick = useCallback(() => {
    if (track) {
      dispatch(push(getEntityLink(track)))
    }
  }, [dispatch, track])
  console.log(track)
  console.log(buyerUser)
  console.log('hiiii')
  if (!track || !buyerUser) return null
  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconTastemaker />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody>
        {messages.congrats}{' '}
        <EntityLink entity={buyerUser} entityType={Entity.User} />{' '}
        {messages.justBoughtYourTrack} ${track.title} for $
        {formatUSDCWeiToUSDString(amount)} {messages.exclamation}
      </NotificationBody>
    </NotificationTile>
  )
}
