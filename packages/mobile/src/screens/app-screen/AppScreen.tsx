import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigatorScreenParams } from '@react-navigation/native'

import { AppTabBar } from './AppTabBar'
import { ExploreTab, ExploreTabParamList } from './ExploreTab'
import { FavoritesTab, FavoritesTabParamList } from './FavoritesTab'
import { FeedTab, FeedTabParamList } from './FeedTab'
import { ProfileTabParamList, ProfileTab } from './ProfileTab'
import { TrendingTab, TrendingTabParamList } from './TrendingTab'

export type AppScreenParamList = {
  feed: NavigatorScreenParams<FeedTabParamList>
  trending: NavigatorScreenParams<TrendingTabParamList>
  explore: NavigatorScreenParams<ExploreTabParamList>
  favorites: NavigatorScreenParams<FavoritesTabParamList>
  profile: NavigatorScreenParams<ProfileTabParamList>
}

const Tab = createBottomTabNavigator()

export const AppScreen = () => {
  return (
    <Tab.Navigator
      tabBar={props => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false, unmountOnBlur: true }}
    >
      <Tab.Screen name='feed' component={FeedTab} />
      <Tab.Screen name='trending' component={TrendingTab} />
      <Tab.Screen name='explore' component={ExploreTab} />
      <Tab.Screen name='favorites' component={FavoritesTab} />
      <Tab.Screen name='profile' component={ProfileTab} />
    </Tab.Navigator>
  )
}
