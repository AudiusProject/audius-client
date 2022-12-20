import { useCallback } from 'react'

import type { AddTrackToPlaylistNotification as AddTrackToPlaylistNotificationType } from '@audius/common'
import { useProxySelector, notificationsSelectors } from '@audius/common'
import { View } from 'react-native'

import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
import { useNotificationNavigation } from 'app/hooks/useNotificationNavigation'

import {
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  EntityLink,
  UserNameLink,
  ProfilePicture
} from '../Notification'
const { getNotificationEntities } = notificationsSelectors

const messages = {
  title: 'Track Added to Playlist',
  addedTrack: ' added your track ',
  toPlaylist: ' to their playlist '
}
type AddTrackToPlaylistNotificationProps = {
  notification: AddTrackToPlaylistNotificationType
}

export const AddTrackToPlaylistNotification = (
  props: AddTrackToPlaylistNotificationProps
) => {
  const { notification } = props
  const navigation = useNotificationNavigation()
  const entities = useProxySelector(
    (state) => getNotificationEntities(state, notification),
    [notification]
  )
  const { track, playlist } = entities
  const playlistOwner = playlist.user

  const handlePress = useCallback(() => {
    if (playlist) {
      navigation.navigate(notification)
    }
  }, [playlist, navigation, notification])

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconPlaylists}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ProfilePicture profile={playlistOwner} />
        <View style={{ flex: 1 }}>
          <NotificationText>
            <UserNameLink user={playlistOwner} />
            {messages.addedTrack}
            <EntityLink entity={track} />
            {messages.toPlaylist}
            <EntityLink entity={playlist} />
          </NotificationText>
        </View>
      </View>
    </NotificationTile>
  )
}
