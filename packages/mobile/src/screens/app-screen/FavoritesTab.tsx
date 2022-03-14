import FavoritesScreen from 'app/screens/favorites-screen'

import { AppTabScreenParamList, createTabScreenStack } from './AppTabScreen'

export type FavoritesTabParamList = AppTabScreenParamList & {
  FavoritesStack: undefined
}

export const FavoritesTab = createTabScreenStack<FavoritesTabParamList>(
  Stack => <Stack.Screen name='FavoritesStack' component={FavoritesScreen} />
)
