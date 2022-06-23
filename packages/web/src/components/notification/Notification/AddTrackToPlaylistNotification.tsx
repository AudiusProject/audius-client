import React, { useCallback } from 'react'

import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { Name } from 'common/models/Analytics'
import {
  AddTrackToPlaylist,
  CollectionEntity,
  Entity,
  TrackEntity
} from 'common/store/notifications/types'
import { make, useRecord } from 'store/analytics/actions'
import { openTwitterLink } from 'utils/tweet'

import styles from './TipSentNotification.module.css'
import { EntityLink } from './components/EntityLink'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { ProfilePicture } from './components/ProfilePicture'
import { TwitterShareButton } from './components/TwitterShareButton'
import { UserNameLink } from './components/UserNameLink'
import { IconAddTrackToPlaylist } from './components/icons'
import { getTwitterHandleByUserHandle, getEntityLink } from './utils'

const messages = {
  title: 'Track Added to Playlist',
  shareTwitterText: (
    track: TrackEntity,
    playlist: CollectionEntity,
    handle: string
  ) =>
    `Listen to my track ${track.title} on ${playlist.playlist_name} by ${handle} on @AudiusProject #Audius`
}

const getTwitterShareInfo = async (notification: AddTrackToPlaylist) => {
  const { track, playlist } = notification.entities
  const playlistOwner = playlist.user

  const link = getEntityLink(track, true)

  let twitterHandle = await getTwitterHandleByUserHandle(playlistOwner.handle)
  if (!twitterHandle) twitterHandle = playlistOwner.name
  else twitterHandle = `@${twitterHandle}`
  const text = messages.shareTwitterText(track, playlist, twitterHandle)

  return { link, text }
}

type AddTrackToPlaylistNotificationProps = {
  notification: AddTrackToPlaylist
}

export const AddTrackToPlaylistNotification = (
  props: AddTrackToPlaylistNotificationProps
) => {
  const { notification } = props
  const { entities, timeLabel, isViewed } = notification
  const { track, playlist } = entities
  const playlistOwner = playlist.user

  const dispatch = useDispatch()
  const record = useRecord()

  const handleShare = useCallback(async () => {
    const shareInfo = await getTwitterShareInfo(notification)
    if (!shareInfo) return
    const { link, text } = shareInfo
    openTwitterLink(link, text)
    record(make(Name.NOTIFICATIONS_CLICK_REMIX_CREATE_TWITTER_SHARE, { text }))
  }, [notification, record])

  const handleClick = useCallback(() => {
    dispatch(push(getEntityLink(playlist)))
  }, [playlist, dispatch])

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconAddTrackToPlaylist />}>
        <NotificationTitle>
          {messages.title}
          {/* <EntityLink entity={parentTrack} entityType={entityType} /> */}
        </NotificationTitle>
      </NotificationHeader>
      {/* <NotificationBody>
        <UserNameLink user={playlistOwner} notification={notification} />
        {' added your track '}
        <EntityLink entity={track} entityType={Entity.Track} />
        {' to their playlist '}
        <EntityLink entity={playlist} entityType={Entity.Playlist} />
      </NotificationBody> */}
      <NotificationBody className={styles.body}>
        <ProfilePicture
          className={styles.profilePicture}
          user={playlistOwner}
        />
        <span>
          <UserNameLink user={playlistOwner} notification={notification} />
          {' added your track '}
          <EntityLink entity={track} entityType={Entity.Track} />
          {' to their playlist '}
          <EntityLink entity={playlist} entityType={Entity.Playlist} />
        </span>
      </NotificationBody>
      <TwitterShareButton onClick={handleShare} />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
