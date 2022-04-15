import { useEffect } from 'react'

import {
  EventArg,
  NavigationState,
  useNavigation
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FavoriteType } from 'audius-client/src/common/models/Favorite'
import { ID } from 'audius-client/src/common/models/Identifiers'
import { NotificationType } from 'audius-client/src/common/store/notifications/types'
import { RepostType } from 'audius-client/src/common/store/user-list/reposts/types'
import { MessageType } from 'audius-client/src/services/native-mobile-interface/types'

import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useDrawer } from 'app/hooks/useDrawer'
import { ContextualParams } from 'app/hooks/useNavigation'
import { CollectionScreen } from 'app/screens/collection-screen/CollectionScreen'
import { ProfileScreen } from 'app/screens/profile-screen'
import {
  SearchResultsScreen,
  TagSearchScreen
} from 'app/screens/search-results-screen'
import { SearchScreen } from 'app/screens/search-screen'
import { TrackScreen } from 'app/screens/track-screen'
import {
  FavoritedScreen,
  FollowersScreen,
  FollowingScreen,
  RepostsScreen,
  NotificationUsersScreen
} from 'app/screens/user-list-screen'

import { EditPlaylistScreen } from '../edit-playlist-screen/EditPlaylistScreen'
import { TrackRemixesScreen } from '../track-screen/TrackRemixesScreen'

import { useAppScreenOptions } from './useAppScreenOptions'

export type AppTabScreenParamList = {
  Track: { id: ID }
  TrackRemixes: { id: ID }
  Profile: { handle: string }
  Collection: { id: ID }
  EditPlaylist: { id: ID }
  Favorited: { id: ID; favoriteType: FavoriteType }
  Reposts: { id: ID; repostType: RepostType }
  Followers: { userId: ID }
  Following: { userId: ID }
  Search: undefined
  SearchResults: { query: string }
  TagSearch: { query: string }
  NotificationUsers: {
    id: string // uuid
    notificationType: NotificationType
    count: number
  }
}

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress
  }
})

type NavigationStateEvent = EventArg<
  'state',
  false,
  { state: NavigationState<AppTabScreenParamList> }
>

type AppTabScreenProps = {
  baseScreen: (
    Stack: ReturnType<typeof createNativeStackNavigator>
  ) => React.ReactNode
  Stack: ReturnType<typeof createNativeStackNavigator>
}

/**
 * This is the base tab screen that includes common screens
 * like track and profile
 */
export const AppTabScreen = ({ baseScreen, Stack }: AppTabScreenProps) => {
  const dispatchWeb = useDispatchWeb()
  const screenOptions = useAppScreenOptions()
  const navigation = useNavigation()
  const drawerNavigation = navigation.getParent()?.getParent()
  const { isOpen: isNowPlayingDrawerOpen } = useDrawer('NowPlaying')

  useEffect(() => {
    drawerNavigation?.setOptions({ swipeEnabled: !isNowPlayingDrawerOpen })
  }, [drawerNavigation, isNowPlayingDrawerOpen])

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      screenListeners={{
        state: (e: NavigationStateEvent) => {
          const stackRoutes = e?.data?.state?.routes
          const isStackOpen = stackRoutes.length > 1
          if (isStackOpen) {
            const isFromNotifs =
              stackRoutes.length === 2 &&
              (stackRoutes[1].params as ContextualParams)?.fromNotifications

            // If coming from notifs allow swipe to open notifs drawer
            drawerNavigation?.setOptions({ swipeEnabled: !!isFromNotifs })
          } else {
            drawerNavigation?.setOptions({ swipeEnabled: true })
          }
        },
        beforeRemove: e => {
          // hack for now to prevent pop for some pages
          if (
            !e.target?.includes('EditProfile') &&
            !(
              e.target?.includes('Search') &&
              !e.target?.includes('SearchResults')
            ) &&
            !e.target?.includes('EditPlaylist') &&
            !e.target?.includes('CreatePlaylist')
          ) {
            // When a screen is removed, notify the web layer to pop navigation
            dispatchWeb({
              type: MessageType.POP_ROUTE
            })
          }
        }
      }}
    >
      {baseScreen(Stack)}
      <Stack.Screen
        name='Track'
        component={TrackScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name='TrackRemixes'
        component={TrackRemixesScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name='Collection'
        component={CollectionScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name='EditPlaylist'
        component={EditPlaylistScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name='Profile'
        component={ProfileScreen}
        options={screenOptions}
      />
      <Stack.Group>
        <Stack.Screen
          name='Search'
          component={SearchScreen}
          options={props => ({
            ...screenOptions(props),
            cardStyleInterpolator: forFade
          })}
        />
        <Stack.Screen
          name='SearchResults'
          component={SearchResultsScreen}
          options={screenOptions}
        />
        <Stack.Screen
          name='TagSearch'
          component={TagSearchScreen}
          options={screenOptions}
        />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name='Followers'
          component={FollowersScreen}
          options={screenOptions}
        />
        <Stack.Screen
          name='Following'
          component={FollowingScreen}
          options={screenOptions}
        />
        <Stack.Screen
          name='Favorited'
          component={FavoritedScreen}
          options={screenOptions}
        />
        <Stack.Screen
          name='Reposts'
          component={RepostsScreen}
          options={screenOptions}
        />
        <Stack.Screen
          name='NotificationUsers'
          component={NotificationUsersScreen}
          options={screenOptions}
        />
      </Stack.Group>
    </Stack.Navigator>
  )
}
