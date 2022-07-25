import { useCallback } from 'react'

import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { Name } from 'common/models/Analytics'
import { getNotificationEntity } from 'common/store/notifications/selectors'
import { TrackEntity, TrendingTrack } from 'common/store/notifications/types'
import { Nullable } from 'common/utils/typeUtils'
import { make } from 'store/analytics/actions'
import { useSelector } from 'utils/reducer'

import { EntityLink } from './components/EntityLink'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { TwitterShareButton } from './components/TwitterShareButton'
import { IconTrending } from './components/icons'
import { getRankSuffix, getEntityLink } from './utils'

const messages = {
  title: 'Trending on Audius!',
  your: 'Your track',
  is: 'is',
  trending: 'on Trending right now!',
  twitterShareText: (entityTitle: string, rank: number) =>
    `My track ${entityTitle} is trending ${rank}${getRankSuffix(
      rank
    )} on @AudiusProject! #AudiusTrending #Audius`
}

type TrendingTrackNotificationProps = {
  notification: TrendingTrack
}

export const TrendingTrackNotification = (
  props: TrendingTrackNotificationProps
) => {
  const { notification } = props
  const { entityType, rank, timeLabel, isViewed } = notification
  const rankSuffix = getRankSuffix(rank)
  const dispatch = useDispatch()
  const track = useSelector(state =>
    getNotificationEntity(state, notification)
  ) as Nullable<TrackEntity>

  const handleClick = useCallback(() => {
    if (track) {
      dispatch(push(getEntityLink(track)))
    }
  }, [dispatch, track])

  if (!track) return null

  const shareText = messages.twitterShareText(track.title, rank)

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconTrending />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody>
        {messages.your} <EntityLink entity={track} entityType={entityType} />{' '}
        {messages.is} {rank}
        {rankSuffix} {messages.trending}
      </NotificationBody>
      <TwitterShareButton
        type='static'
        url={getEntityLink(track, true)}
        shareText={shareText}
        analytics={make(Name.NOTIFICATIONS_CLICK_MILESTONE_TWITTER_SHARE, {
          milestone: shareText
        })}
      />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
