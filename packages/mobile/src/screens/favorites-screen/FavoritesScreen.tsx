import { reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import IconAlbum from 'app/assets/images/iconAlbum.svg'
import IconNote from 'app/assets/images/iconNote.svg'
import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'
import { TopTabNavigator } from 'app/components/top-tab-bar'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'

import { AlbumsTab } from './AlbumsTab'
import { PlaylistsTab } from './PlaylistsTab'
import { TracksTab } from './TracksTab'
const { getIsReachable } = reachabilitySelectors

const favoritesScreens = [
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
]

export const FavoritesScreen = () => {
  usePopToTopOnDrawerOpen()
  const isNotReachable = useSelector(getIsReachable) === false

  return (
    <Screen>
      <Header text='Favorites' />
      {isNotReachable ? (
        <OfflinePlaceholder />
      ) : (
        <TopTabNavigator screens={favoritesScreens} />
      )}
    </Screen>
  )
}
