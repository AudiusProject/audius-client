import { TrendingScreen } from 'app/screens/trending-screen'

import { AppTabScreenParamList, createTabScreenStack } from './AppTabScreen'

export type TrendingTabScreenParamList = AppTabScreenParamList & {
  TrendingStack: undefined
}

export const TrendingTabScreen = createTabScreenStack<
  TrendingTabScreenParamList
>(Stack => <Stack.Screen name='Trending' component={TrendingScreen} />)
