import { useCallback } from 'react'

import type {
  Nullable,
  TrackEntity,
  TrendingTrackNotification as TrendingTrackNotificationType
} from '@audius/common'
import { notificationsSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import IconTrending from 'app/assets/images/iconTrending.svg'

import { useNotificationNavigation } from '../../app-drawer-screen'
import {
  EntityLink,
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle
} from '../Notification'
const { getNotificationEntity } = notificationsSelectors

const getRankSuffix = (rank: number) => {
  if (rank === 1) return 'st'
  if (rank === 2) return 'nd'
  if (rank === 3) return 'rd'
  return 'th'
}

const messages = {
  title: 'Trending on Audius!',
  your: 'Your track',
  is: 'is',
  trending: 'on Trending right now!'
}

type TrendingTrackNotificationProps = {
  notification: TrendingTrackNotificationType
}

export const TrendingTrackNotification = (
  props: TrendingTrackNotificationProps
) => {
  const { notification } = props
  const { rank } = notification
  const rankSuffix = getRankSuffix(rank)
  const track = useSelector((state) =>
    getNotificationEntity(state, notification)
  ) as Nullable<TrackEntity>
  const navigation = useNotificationNavigation()

  const handlePress = useCallback(() => {
    if (track) {
      navigation.navigate('Track', { id: track.track_id })
    }
  }, [navigation, track])

  if (!track) return null

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconTrending}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationText>
        {messages.your} <EntityLink entity={track} /> {messages.is} {rank}
        {rankSuffix} {messages.trending}
      </NotificationText>
    </NotificationTile>
  )
}
