import IconAlbum from 'app/assets/images/iconAlbum.svg'
import IconNote from 'app/assets/images/iconNote.svg'
import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import {
  TabNavigator,
  tabScreen
} from 'app/components/app-navigator/TopTabNavigator'
import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'

import { AlbumsTab } from './tabs/AlbumsTab'
import { PlaylistsTab } from './tabs/PlaylistsTab'
import { ProfilesTab } from './tabs/ProfilesTab'
import { TracksTab } from './tabs/TracksTab'

const messages = {
  header: 'More Results'
}

export const SearchResultsScreen = () => {
  const profilesScreen = tabScreen({
    name: 'Profiles',
    Icon: IconUser,
    component: ProfilesTab
  })

  const tracksScreen = tabScreen({
    name: 'Tracks',
    Icon: IconNote,
    component: TracksTab
  })

  const albumsScreen = tabScreen({
    name: 'Albums',
    Icon: IconAlbum,
    component: AlbumsTab
  })

  const playlistsScreen = tabScreen({
    name: 'Playlists',
    Icon: IconPlaylists,
    component: PlaylistsTab
  })

  return (
    <Screen topbarRight={null} noPadding>
      <Header text={messages.header} />
      <TabNavigator initialScreenName='Profiles'>
        {profilesScreen}
        {tracksScreen}
        {albumsScreen}
        {playlistsScreen}
      </TabNavigator>
    </Screen>
  )
}
