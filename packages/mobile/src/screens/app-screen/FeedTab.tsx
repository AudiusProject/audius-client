import { FeedScreen } from 'app/screens/feed-screen'

import { AppTabScreenParamList, createTabScreenStack } from './AppTabScreen'

export type FeedTabParamList = AppTabScreenParamList & {
  FeedStack: undefined
}

export const FeedTab = createTabScreenStack<FeedTabParamList>(Stack => (
  <Stack.Screen name='FeedStack' component={FeedScreen} />
))
