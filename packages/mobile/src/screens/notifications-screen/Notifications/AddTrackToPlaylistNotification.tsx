import { useCallback } from 'react'

import {
  getNotificationEntities,
  getNotificationEntity,
  getNotificationUser
} from 'audius-client/src/common/store/notifications/selectors'
import {
  AddTrackToPlaylist,
  Entity
} from 'audius-client/src/common/store/notifications/types'
import { isEqual } from 'lodash'
import { View } from 'react-native'

import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
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
import { getEntityRoute, getEntityScreen } from '../Notification/utils'
import { useDrawerNavigation } from '../useDrawerNavigation'

const messages = {
  title: 'Track Added to Playlist'
}
type AddTrackToPlaylistNotificationProps = {
  notification: AddTrackToPlaylist
}

export const AddTrackToPlaylistNotification = (
  props: AddTrackToPlaylistNotificationProps
) => {
  console.log(`AddTrackToPlaylistNotificationProps ${JSON.stringify(props)}`)
  // LOG  AddTrackToPlaylistNotificationProps {"notification":{"id":"6c3ec116-224c-436b-8bee-95ec840341c3","isHidden":false,"isRead":false,"isViewed":true,"timestamp":"2022-06-10T18:19:32.000Z","type":"AddTrackToPlaylist","playlistId":1400,"playlistOwnerId":38872,"trackId":20998,"timeLabel":"1 Week ago"}}

  const { notification } = props
  const entities = useSelectorWeb(
    state => getNotificationEntities(state, notification),
    isEqual
  )
  const { track, playlist } = entities
  const playlistOwner = playlist.user

  console.log(`entities`)
  console.log(`entities ${JSON.stringify(entities)}`)
  const navigation = useDrawerNavigation()

  const handlePress = useCallback(() => {
    console.log(`handlePress`)
    if (playlist) {
      navigation.navigate({
        native: getEntityScreen(playlist),
        web: { route: getEntityRoute(playlist) }
      })
    }
  }, [playlist, navigation])

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
            {' added your track '}
            <EntityLink entity={track} />
            {' to their playlist '}
            <EntityLink entity={playlist} />
          </NotificationText>
        </View>
      </View>
    </NotificationTile>
  )
}
