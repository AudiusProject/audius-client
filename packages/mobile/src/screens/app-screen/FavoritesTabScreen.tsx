import FavoritesScreen from 'app/screens/favorites-screen'

import { AppTabScreenParamList, createTabScreenStack } from './AppTabScreen'

export type FavoritesTabScreenParamList = AppTabScreenParamList & {
  FavoritesStack: undefined
}

export const FavoritesTabScreen = createTabScreenStack<
  FavoritesTabScreenParamList
>(Stack => <Stack.Screen name='Favorites' component={FavoritesScreen} />)
