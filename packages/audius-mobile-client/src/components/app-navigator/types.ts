import { NavigatorScreenParams } from '@react-navigation/native'
import { ID } from 'audius-client/src/common/models/Identifiers'

export type BaseStackParamList = {
  track: { id: ID }
  profile: { handle: string }
}

export type FeedStackParamList = BaseStackParamList & {
  'feed-stack': undefined
}

export type TrendingStackParamList = BaseStackParamList & {
  'trending-stack': undefined
}

export type ExploreStackParamList = BaseStackParamList & {
  'explore-stack': undefined
}

export type FavoritesStackParamList = BaseStackParamList & {
  'favorites-stack': undefined
}

export type ProfileStackParamList = BaseStackParamList & {
  'profile-stack': undefined
}

export type BottomTabsParamList = {
  feed: NavigatorScreenParams<FeedStackParamList>
  trending: NavigatorScreenParams<TrendingStackParamList>
  explore: NavigatorScreenParams<ExploreStackParamList>
  favorites: NavigatorScreenParams<FavoritesStackParamList>
  profile: NavigatorScreenParams<ProfileStackParamList>
}

export type AppStackParamList = {
  signOn: undefined
  main: NavigatorScreenParams<BottomTabsParamList>
}
