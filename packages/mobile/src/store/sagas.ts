import {
  remoteConfigSagas as remoteConfig,
  mobileOverflowMenuUISagas as overflowMenuSagas,
  shareModalUISagas as shareModalSagas
} from '@audius/common'
import analyticsSagas from 'audius-client/src/common/store/analytics/sagas'
import accountSagas from 'common/store/account/sagas'
import backendSagas, { setupBackend } from 'common/store/backend/sagas'
import collectionsSagas from 'common/store/cache/collections/sagas'
import coreCacheSagas from 'common/store/cache/sagas'
import tracksSagas from 'common/store/cache/tracks/sagas'
import usersSagas from 'common/store/cache/users/sagas'
import confirmerSagas from 'common/store/confirmer/sagas'
import notificationsSagas from 'common/store/notifications/sagas'
import collectionPageSagas from 'common/store/pages/collection/sagas'
import exploreCollectionsPageSagas from 'common/store/pages/explore/exploreCollections/sagas'
import explorePageSagas from 'common/store/pages/explore/sagas'
import feedPageSagas from 'common/store/pages/feed/sagas'
import savedSagas from 'common/store/pages/saved/sagas'
import searchResultsSagas from 'common/store/pages/search-page/sagas'
import signOnSagas from 'common/store/pages/signon/sagas'
import trackPageSagas from 'common/store/pages/track/sagas'
import trendingPlaylistSagas from 'common/store/pages/trending-playlists/sagas'
import trendingUndergroundSagas from 'common/store/pages/trending-underground/sagas'
import trendingPageSagas from 'common/store/pages/trending/sagas'
import playerSagas from 'common/store/player/sagas'
import queueSagas from 'common/store/queue/sagas'
import searchBarSagas from 'common/store/search-bar/sagas'
import signOutSagas from 'common/store/sign-out/sagas'
import smartCollectionPageSagas from 'common/store/smart-collection/sagas'
import socialSagas from 'common/store/social/sagas'
import favoritePageSagas from 'common/store/user-list/favorites/sagas'
import followersPageSagas from 'common/store/user-list/followers/sagas'
import followingPageSagas from 'common/store/user-list/following/sagas'
import mutualsPageSagas from 'common/store/user-list/mutuals/sagas'
import notificationUsersPageSagas from 'common/store/user-list/notifications/sagas'
import repostPageSagas from 'common/store/user-list/reposts/sagas'
import supportingPageSagas from 'common/store/user-list/supporting/sagas'
import topSupportersPageSagas from 'common/store/user-list/top-supporters/sagas'
import { all, fork } from 'typed-redux-saga'

import initKeyboardEvents from './keyboard/sagas'
import notificationsSagasNative from './notifications/sagas'
import oauthSagas from './oauth/sagas'

export default function* rootSaga() {
  yield* fork(setupBackend)
  const sagas = [
    // config
    ...backendSagas(),
    ...analyticsSagas(),
    ...accountSagas(),
    ...confirmerSagas(),
    ...searchBarSagas(),
    ...searchResultsSagas(),

    // Cache
    ...coreCacheSagas(),
    ...collectionsSagas(),
    ...tracksSagas(),
    ...usersSagas(),

    // Playback
    ...playerSagas(),
    ...queueSagas(),

    // Sign in / Sign out
    ...signOnSagas(),
    ...signOutSagas(),

    ...notificationsSagas(),
    ...notificationsSagasNative(),

    // Pages
    ...trackPageSagas(),
    ...collectionPageSagas(),
    ...feedPageSagas(),
    ...trendingPageSagas(),
    ...exploreCollectionsPageSagas(),
    ...trendingPageSagas(),
    ...explorePageSagas(),
    ...trendingPlaylistSagas(),
    ...trendingUndergroundSagas(),
    ...savedSagas(),
    ...socialSagas(),
    ...favoritePageSagas(),
    ...followersPageSagas(),
    ...followingPageSagas(),
    ...mutualsPageSagas(),
    ...notificationUsersPageSagas(),
    ...repostPageSagas(),
    ...supportingPageSagas(),
    ...topSupportersPageSagas(),

    // Application
    ...smartCollectionPageSagas(),
    ...overflowMenuSagas(),
    ...shareModalSagas(),

    initKeyboardEvents,
    ...remoteConfig(),
    ...oauthSagas()
  ]

  yield* all(sagas.map(fork))
}
