import { ReactNode, useContext } from 'react'

import {
  getStateFromPath,
  LinkingOptions,
  NavigationContainer as RNNavigationContainer
} from '@react-navigation/native'
import { getAccountUser } from 'audius-client/src/common/store/account/selectors'

import { usePushRouteWeb } from 'app/hooks/usePushRouteWeb'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { RootScreenParamList } from 'app/screens/root-screen/RootScreen'

import { ThemeContext } from '../theme/ThemeContext'

import { navigationThemes } from './navigationThemes'

type Props = {
  children: ReactNode
}
/**
 * NavigationContainer contains the react-navigation context
 * and configures linking
 */
const NavigationContainer = ({ children }: Props) => {
  const { theme, isSystemDarkMode } = useContext(ThemeContext)
  const pushRouteWeb = usePushRouteWeb()
  const account = useSelectorWeb(getAccountUser)

  const navigationTheme =
    theme === 'auto' ? (isSystemDarkMode ? 'dark' : 'default') : theme

  const linking: LinkingOptions<RootScreenParamList> = {
    prefixes: ['https://audius.co', 'https://staging.audius.co'],
    // configuration for matching screens with paths
    config: {
      screens: {
        App: {
          screens: {
            MainStack: {
              initialRouteName: 'feed',
              screens: {
                feed: {
                  initialRouteName: 'Feed',
                  screens: {
                    Feed: 'feed',
                    Collection: '*/playlist/*',
                    Track: 'track',
                    // Unfortunately routes like username/playlists
                    // don't load properly on web. So for now deep linking
                    // to profile tabs (other than for your own account) isn't
                    // implemented
                    Profile: {
                      path: ':handle',
                      screens: {
                        Tracks: 'tracks',
                        Albums: 'albums',
                        Playlists: 'playlists',
                        Reposts: 'reposts',
                        Collectibles: 'collectibles'
                      }
                    } as any // Nested navigator typing with own params is broken, see: https://github.com/react-navigation/react-navigation/issues/9897
                  }
                },
                trending: {
                  initialRouteName: 'Trending',
                  screens: {
                    Trending: 'trending'
                  }
                },
                explore: {
                  initialRouteName: 'Explore',
                  screens: {
                    Explore: 'explore',
                    TrendingPlaylists: 'explore/playlists',
                    TrendingUnderground: 'explore/underground',
                    LetThemDJ: 'explore/let-them-dj',
                    TopAlbums: 'explore/top-albums',
                    UnderTheRadar: 'explore/under-the-radar',
                    BestNewReleases: 'explore/best-new-releases',
                    Remixables: 'explore/remixables',
                    MostLoved: 'explore/most-loved',
                    FeelingLucky: 'explore/feeling-lucky',
                    HeavyRotation: 'explore/heavy-rotation',
                    ChillPlaylists: 'explore/chill',
                    IntensePlaylists: 'explore/intense',
                    IntimatePlaylists: 'explore/intimate',
                    ProvokingPlaylists: 'explore/provoking',
                    UpbeatPlaylists: 'explore/upbeat'
                  }
                },
                favorites: {
                  screens: {
                    Favorites: 'favorites'
                  }
                },
                profile: {
                  screens: {
                    UserProfile: {
                      path: 'profile',
                      screens: {
                        Tracks: 'tracks',
                        Albums: 'albums',
                        Playlists: 'playlists',
                        Reposts: 'reposts',
                        Collectibles: 'collectibles'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    getStateFromPath: (path, options) => {
      // Strip the trending query param because `/trending` will
      // always go to ThisWeek
      if (path.match(/^\/trending/)) {
        path = '/trending'
      }

      pushRouteWeb(path, undefined, false)

      if (path.match(`^/${account?.handle}(/|$)`)) {
        // If the path is the current user and set path as `/profile`
        path = path.replace(`/${account?.handle}`, '/profile')
      } else {
        // If the path has two parts
        if (path.match(/^\/[^/]+\/[^/]+$/)) {
          // If the path doesn't match a profile tab, it's a track
          if (
            !path.match(
              /^\/[^/]+\/(tracks|albums|playlists|reposts|collectibles)$/
            )
          ) {
            path = '/track'
          }
        }
      }

      return getStateFromPath(path, options)
    }
  }

  return (
    <RNNavigationContainer
      linking={linking}
      theme={navigationThemes[navigationTheme]}
    >
      {children}
    </RNNavigationContainer>
  )
}

export default NavigationContainer
