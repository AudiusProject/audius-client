import { FeedScreen } from 'app/screens/feed-screen'

import { AppTabScreenParamList, createTabScreenStack } from './AppTabScreen'

export type FeedTabScreenParamList = AppTabScreenParamList & {
  FeedStack: undefined
}

export const FeedTabScreen = createTabScreenStack<FeedTabScreenParamList>(
  Stack => <Stack.Screen name='Feed' component={FeedScreen} />
)
