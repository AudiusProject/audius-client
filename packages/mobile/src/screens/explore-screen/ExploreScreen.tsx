import { explorePageActions, reachabilitySelectors } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useEffectOnce } from 'react-use'

import IconForYou from 'app/assets/images/iconExploreForYou.svg'
import IconMoods from 'app/assets/images/iconExploreMoods.svg'
import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'
import { OfflinePlaceholder } from 'app/components/offline-placeholder'
import { TopTabNavigator } from 'app/components/top-tab-bar'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'

import { ArtistsTab } from './tabs/ArtistsTab'
import { ForYouTab } from './tabs/ForYouTab'
import { MoodsTab } from './tabs/MoodsTab'
import { PlaylistsTab } from './tabs/PlaylistsTab'

const { getIsReachable } = reachabilitySelectors
const { fetchExplore } = explorePageActions

const exploreScreens = [
  {
    name: 'forYou',
    label: 'For You',
    Icon: IconForYou,
    component: ForYouTab
  },
  {
    name: 'moods',
    Icon: IconMoods,
    component: MoodsTab
  },
  {
    name: 'playlists',
    Icon: IconPlaylists,
    component: PlaylistsTab
  },
  {
    name: 'artists',
    Icon: IconUser,
    component: ArtistsTab
  }
]

const ExploreScreen = () => {
  const dispatch = useDispatch()
  usePopToTopOnDrawerOpen()

  // TODO: put back the logic
  // const isNotReachable = useSelector(getIsReachable) === false
  const isNotReachable = true

  // TODO: check if we need to re-do this on reconnect
  useEffectOnce(() => {
    dispatch(fetchExplore())
  })

  return (
    <Screen>
      <Header text='Explore' />
      {isNotReachable ? (
        <OfflinePlaceholder />
      ) : (
        <TopTabNavigator screens={exploreScreens} />
      )}
    </Screen>
  )
}

export default ExploreScreen
