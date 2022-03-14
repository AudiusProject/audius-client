import { TrendingScreen } from 'app/screens/trending-screen'

import { AppTabScreenParamList, createTabScreenStack } from './AppTabScreen'

export type TrendingTabParamList = AppTabScreenParamList & {
  TrendingStack: undefined
}

export const TrendingTab = createTabScreenStack<TrendingTabParamList>(Stack => (
  <Stack.Screen name='TrendingStack' component={TrendingScreen} />
))
