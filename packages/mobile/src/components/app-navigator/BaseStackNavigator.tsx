import { createStackNavigator } from '@react-navigation/stack'
import { MessageType } from 'audius-client/src/services/native-mobile-interface/types'

import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { CollectionScreen } from 'app/screens/collection-screen/CollectionScreen'
import { ProfileScreen } from 'app/screens/profile-screen'
import { SearchResultsScreen } from 'app/screens/search-results-screen'
import { SearchScreen } from 'app/screens/search-screen'
import { TrackScreen } from 'app/screens/track-screen'
import {
  FavoritedScreen,
  FollowersScreen,
  FollowingScreen,
  RepostsScreen
} from 'app/screens/user-list-screen'

import { useScreenOptions } from './baseStackScreenOptions'

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress
  }
})

type BaseNavigatorProps = {
  baseScreen: (
    Stack: ReturnType<typeof createStackNavigator>
  ) => React.ReactNode
  Stack: ReturnType<typeof createStackNavigator>
}

/**
 * This is the base stack that includes common screens
 * like track and profile
 */
export const BaseStackNavigator = ({
  baseScreen,
  Stack
}: BaseNavigatorProps) => {
  const dispatchWeb = useDispatchWeb()
  const screenOptions = useScreenOptions()
  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      screenListeners={() => ({
        beforeRemove: e => {
          // hack for now to prevent pop for some pages
          console.log(
            e.target,
            e.target?.includes('Search'),
            !e.target?.includes('SearchResults')
          )
          if (
            !e.target?.includes('EditProfile') &&
            !(
              e.target?.includes('Search') &&
              !e.target?.includes('SearchResults')
            )
          ) {
            console.log('this should not happen')
            // When a screen is removed, notify the web layer to pop navigation
            dispatchWeb({
              type: MessageType.POP_ROUTE
            })
          }
        }
      })}
    >
      {baseScreen(Stack)}
      <Stack.Screen name='Track' component={TrackScreen} />
      <Stack.Screen name='Collection' component={CollectionScreen} />
      <Stack.Screen name='Profile' component={ProfileScreen} />
      <Stack.Group>
        <Stack.Screen
          name='Search'
          component={SearchScreen}
          options={{ cardStyleInterpolator: forFade }}
        />
        <Stack.Screen name='SearchResults' component={SearchResultsScreen} />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen name='FollowersScreen' component={FollowersScreen} />
        <Stack.Screen name='FollowingScreen' component={FollowingScreen} />
        <Stack.Screen name='FavoritedScreen' component={FavoritedScreen} />
        <Stack.Screen name='RepostsScreen' component={RepostsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  )
}
