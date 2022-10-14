import { explorePageActions, reachabilitySelectors } from '@audius/common'
import { useDispatch, useSelector } from 'react-redux'
import { useEffectOnce } from 'react-use'

import IconForYou from 'app/assets/images/iconExploreForYou.svg'
import IconMoods from 'app/assets/images/iconExploreMoods.svg'
import IconPlaylists from 'app/assets/images/iconPlaylists.svg'
import IconUser from 'app/assets/images/iconUser.svg'
import { Screen } from 'app/components/core'
import { Header } from 'app/components/header'
import { TopTabNavigator } from 'app/components/top-tab-bar'
import { usePopToTopOnDrawerOpen } from 'app/hooks/usePopToTopOnDrawerOpen'

import { ScreenContent } from '../ScreenContent'

import { ArtistsTab } from './tabs/ArtistsTab'
import { ForYouTab } from './tabs/ForYouTab'
import { MoodsTab } from './tabs/MoodsTab'
import { PlaylistsTab } from './tabs/PlaylistsTab'

const { fetchExplore } = explorePageActions
const { getIsReachable } = reachabilitySelectors

const messages = {
  header: 'Explore',
  forYou: 'For You'
}

const exploreScreens = [
  {
    name: 'forYou',
    label: messages.forYou,
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
  const isReachable = useSelector(getIsReachable)

  useEffectOnce(() => {
    if (isReachable) {
      dispatch(fetchExplore())
    }
  })

  return (
    <Screen>
      <Header text={messages.header} />
      <ScreenContent>
        <TopTabNavigator screens={exploreScreens} />
      </ScreenContent>
    </Screen>
  )
}

export default ExploreScreen
