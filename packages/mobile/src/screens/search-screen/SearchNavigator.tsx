import {
  CardStyleInterpolators,
  createStackNavigator
} from '@react-navigation/stack'

import { SearchStackParamList } from 'app/components/app-navigator/types'
import { SearchResultsScreen } from 'app/screens/search-results-screen/SearchResultsScreen'

import SearchScreen from './Search'

/**
 * The search stack
 */
export const SearchNavigator = () => {
  const Stack = createStackNavigator<SearchStackParamList>()
  return (
    <Stack.Navigator
      screenOptions={{
        cardOverlayEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureResponseDistance: 1000
      }}
    >
      <Stack.Screen name='search-stack' component={SearchScreen} />
      <Stack.Screen name='search-results' component={SearchResultsScreen} />
    </Stack.Navigator>
  )
}
