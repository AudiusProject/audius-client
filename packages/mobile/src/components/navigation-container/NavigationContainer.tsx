import type { ReactNode } from 'react'
import { useRef } from 'react'

import { accountSelectors } from '@audius/common'
import type { LinkingOptions } from '@react-navigation/native'
import {
  useNavigationContainerRef,
  getStateFromPath,
  NavigationContainer as RNNavigationContainer
} from '@react-navigation/native'
import { useSelector } from 'react-redux'

import { AppTabNavigationProvider } from 'app/screens/app-screen'
import type { RootScreenParamList } from 'app/screens/root-screen/RootScreen'
import { screen } from 'app/services/analytics'
import { getPrimaryRoute, getRoutePath } from 'app/utils/navigation'
import { useThemeVariant } from 'app/utils/theme'

import { navigationThemes } from './navigationThemes'
const { getAccountUser } = accountSelectors

type NavigationContainerProps = {
  children: ReactNode
}
/**
 * NavigationContainer contains the react-navigation context
 * and configures linking
 */
const NavigationContainer = (props: NavigationContainerProps) => {
  const { children } = props
  const theme = useThemeVariant()
  const account = useSelector(getAccountUser)

  const navigationRef = useNavigationContainerRef()
  const routeNameRef = useRef<string>()

  const linking: LinkingOptions<RootScreenParamList> = {
    prefixes: [
      'https://audius.co',
      'http://audius.co',
      'https://staging.audius.co',
      'http://staging.audius.co'
    ],
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
                    Collection: ':handle/collection/:collectionName',
                    Track: 'track/:handle/:slug',
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
                    },
                    SettingsScreen: {
                      path: 'settings'
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

      if (path.match(`^/${account?.handle}(/|$)`)) {
        // If the path is the current user and set path as `/profile`
        path = path.replace(`/${account?.handle}`, '/profile')
      } else {
        // If the path has two parts
        if (path.match(/^\/[^/]+\/[^/]+$/)) {
          // If the path is to audio-nft-playlist, reroute to feed
          if (path.match(/^\/[^/]+\/audio-nft-playlist$/)) {
            path = '/feed'
          }
          // If the path doesn't match a profile tab, it's a track
          else if (
            !path.match(
              /^\/[^/]+\/(tracks|albums|playlists|reposts|collectibles)$/
            )
          ) {
            path = `/track/${path}`
          }
        }

        // If the path is a playlist or album
        if (path.match(/^\/[^/]+\/(playlist|album)\/[^/]+$/)) {
          // set the path as `collection`
          path = path.replace(
            /(^\/[^/]+\/)(playlist|album)(\/[^/]+$)/,
            '$1collection$3'
          )
        }
      }

      return getStateFromPath(path, options)
    }
  }

  return (
    <RNNavigationContainer
      linking={linking}
      theme={navigationThemes[theme]}
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = getPrimaryRoute(navigationRef.getRootState())
      }}
      onStateChange={async () => {
        // Record screen views for the primary routes
        // Secondary routes (e.g. Track, Collection, Profile) are recorded via
        // an effect in the corresponding component
        const previousRouteName = routeNameRef.current
        const currentRouteName = getPrimaryRoute(navigationRef.getRootState())

        if (currentRouteName && previousRouteName !== currentRouteName) {
          screen({ route: `/${currentRouteName}` })
        }

        routeNameRef.current = currentRouteName
      }}
    >
      <AppTabNavigationProvider>{children}</AppTabNavigationProvider>
    </RNNavigationContainer>
  )
}

export default NavigationContainer
