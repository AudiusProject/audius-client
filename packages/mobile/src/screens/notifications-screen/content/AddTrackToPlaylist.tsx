import {
  AddTrackToPlaylist as AddTrackToPlaylistNotification,
  Entity as EntityType
} from 'audius-client/src/common/store/notifications/types'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from 'app/utils/theme'

import Entity from './Entity'
import TwitterShare from './TwitterShare'
import User from './User'

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column'
  },
  text: {
    fontFamily: 'AvenirNextLTPro-Bold',
    fontSize: 16,
    marginBottom: 8
  }
})

type AddTrackToPlaylistProps = {
  notification: AddTrackToPlaylistNotification
}

const AddTrackToPlaylist = ({ notification }: AddTrackToPlaylistProps) => {
  const { entities } = notification
  const { track, playlist } = entities
  const playlistOwner = playlist.user

  const textStyle = useTheme(styles.text, {
    color: 'neutral'
  })

  return (
    <View style={styles.wrapper}>
      <Text style={textStyle}>
        <User user={playlistOwner} />
        {' added your track '}
        <Entity entity={track} entityType={EntityType.Track} />
        {' to their playlist '}
        <Entity entity={playlist} entityType={EntityType.Playlist} />
      </Text>
      <TwitterShare notification={notification} />
    </View>
  )
}

export default AddTrackToPlaylist
