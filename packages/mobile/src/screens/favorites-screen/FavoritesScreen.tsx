import { Dimensions, View } from 'react-native'

import IconAlbum from 'app/assets/images/iconAlbum.svg'
import IconNote from 'app/assets/images/iconNote.svg'
import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
import TopTabNavigator from 'app/components/app-navigator/TopTabNavigator'
import { Header } from 'app/components/header'

import { AlbumsTab } from './AlbumsTab'
import { PlaylistsTab } from './PlaylistsTab'
import { TracksTab } from './TracksTab'

const screenHeight = Dimensions.get('window').height

const FavoritesScreen = () => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: screenHeight
      }}
    >
      <Header text='Favorites' />
      <View style={{ flex: 1 }}>
        <TopTabNavigator
          initialScreenName='tracks'
          screens={[
            {
              name: 'tracks',
              Icon: IconNote,
              component: TracksTab
            },
            {
              name: 'albums',
              Icon: IconAlbum,
              component: AlbumsTab
            },
            {
              name: 'playlists',
              Icon: IconPlaylists,
              component: PlaylistsTab
            }
          ]}
        />
      </View>
    </View>
  )
}

export default FavoritesScreen
