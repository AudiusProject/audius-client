import {
  castSagas,
  chatSagas,
  playerSagas as commonPlayerSagas,
  playbackPositionSagas,
  premiumContentSagas,
  remoteConfigSagas as remoteConfig,
  deletePlaylistConfirmationModalUISagas as deletePlaylistConfirmationModalSagas,
  publishPlaylistConfirmationModalUISagas as publishPlaylistConfirmationModalSagas,
  mobileOverflowMenuUISagas as overflowMenuSagas,
  shareModalUISagas as shareModalSagas,
  vipDiscordModalSagas,
  reachabilitySagas,
  relatedArtistsSagas,
  searchUsersModalSagas,
  solanaSagas,
  toastSagas
} from '@audius/common'
import addToPlaylistSagas from 'common/store/add-to-playlist/sagas'
import analyticsSagas from 'common/store/analytics/sagas'
import backendSagas from 'common/store/backend/sagas'
import coreCacheSagas from 'common/store/cache/sagas'
import tracksSagas from 'common/store/cache/tracks/sagas'
import usersSagas from 'common/store/cache/users/sagas'
import changePasswordSagas from 'common/store/change-password/sagas'
import confirmerSagas from 'common/store/confirmer/sagas'
import aiSagas from 'common/store/pages/ai/sagas'
import rewardsPageSagas from 'common/store/pages/audio-rewards/sagas'
import collectionPageSagas from 'common/store/pages/collection/sagas'
import deactivateAccountSagas from 'common/store/pages/deactivate-account/sagas'
import exploreCollectionsPageSagas from 'common/store/pages/explore/exploreCollections/sagas'
import explorePageSagas from 'common/store/pages/explore/sagas'
import feedPageSagas from 'common/store/pages/feed/sagas'
import historySagas from 'common/store/pages/history/sagas'
import remixesSagas from 'common/store/pages/remixes-page/sagas'
import savedSagas from 'common/store/pages/saved/sagas'
import searchResultsSagas from 'common/store/pages/search-page/sagas'
import signOnSagas from 'common/store/pages/signon/sagas'
import tokenDashboardSagas from 'common/store/pages/token-dashboard/sagas'
import trackPageSagas from 'common/store/pages/track/sagas'
import trendingPlaylistSagas from 'common/store/pages/trending-playlists/sagas'
import trendingUndergroundSagas from 'common/store/pages/trending-underground/sagas'
import trendingPageSagas from 'common/store/pages/trending/sagas'
import playerSagas from 'common/store/player/sagas'
import playlistLibrarySagas from 'common/store/playlist-library/sagas'
import profileSagas from 'common/store/profile/sagas'
import queueSagas from 'common/store/queue/sagas'
import recoveryEmailSagas from 'common/store/recovery-email/sagas'
import remixSettingsSagas from 'common/store/remix-settings/sagas'
import savedCollectionsSagas from 'common/store/saved-collections/sagas'
import searchBarSagas from 'common/store/search-bar/sagas'
import smartCollectionPageSagas from 'common/store/smart-collection/sagas'
import socialSagas from 'common/store/social/sagas'
import tippingSagas from 'common/store/tipping/sagas'
import reactionSagas from 'common/store/ui/reactions/sagas'
import uploadSagas from 'common/store/upload/sagas'
import favoritePageSagas from 'common/store/user-list/favorites/sagas'
import followersPageSagas from 'common/store/user-list/followers/sagas'
import followingPageSagas from 'common/store/user-list/following/sagas'
import mutualsPageSagas from 'common/store/user-list/mutuals/sagas'
import notificationUsersPageSagas from 'common/store/user-list/notifications/sagas'
import relatedArtistsPageSagas from 'common/store/user-list/related-artists/sagas'
import repostPageSagas from 'common/store/user-list/reposts/sagas'
import supportingPageSagas from 'common/store/user-list/supporting/sagas'
import topSupportersPageSagas from 'common/store/user-list/top-supporters/sagas'
import walletSagas from 'common/store/wallet/sagas'
import { all, fork } from 'typed-redux-saga'

import collectionsSagas from 'app/store/cache/collections/sagas'

import accountSagas from './account/sagas'
import mobileChatSagas from './chat/sagas'
import initKeyboardEvents from './keyboard/sagas'
import notificationsSagas from './notifications/sagas'
import oauthSagas from './oauth/sagas'
import offlineDownloadSagas from './offline-downloads/sagas'
import rateCtaSagas from './rate-cta/sagas'
import { searchSagas } from './search/searchSagas'
import settingsSagas from './settings/sagas'
import signOutSagas from './sign-out/sagas'
import signUpSagas from './sign-up/sagas'
import themeSagas from './theme/sagas'
import walletsSagas from './wallet-connect/sagas'

export default function* rootSaga() {
  const sagas = [
    // Config
    ...backendSagas(),
    ...analyticsSagas(),
    ...confirmerSagas(),
    ...searchBarSagas(),
    ...searchResultsSagas(),

    // Account
    ...accountSagas(),
    ...recoveryEmailSagas(),
    ...playlistLibrarySagas(),

    // Cache
    ...coreCacheSagas(),
    ...collectionsSagas(),
    ...tracksSagas(),
    ...usersSagas(),
    ...savedCollectionsSagas(),

    // Playback
    ...commonPlayerSagas(),
    ...playerSagas(),
    ...queueSagas(),
    ...playbackPositionSagas(),

    // Sign in / Sign out
    ...signOnSagas(),
    ...signOutSagas(),

    // Sign up
    ...signUpSagas(),

    // Tipping
    ...tippingSagas(),
    ...solanaSagas(),

    // Premium content
    ...premiumContentSagas(),

    // Search Users
    ...searchUsersModalSagas(),

    ...walletSagas(),

    ...notificationsSagas(),

    // Pages
    ...trackPageSagas(),
    ...chatSagas(),
    ...mobileChatSagas(),
    ...collectionPageSagas(),
    ...feedPageSagas(),
    ...exploreCollectionsPageSagas(),
    ...explorePageSagas(),
    ...trendingPageSagas(),
    ...trendingPlaylistSagas(),
    ...trendingUndergroundSagas(),
    ...savedSagas(),
    ...profileSagas(),
    ...reactionSagas(),
    ...socialSagas(),
    ...favoritePageSagas(),
    ...followersPageSagas(),
    ...followingPageSagas(),
    ...mutualsPageSagas(),
    ...notificationUsersPageSagas(),
    ...relatedArtistsPageSagas(),
    ...repostPageSagas(),
    ...supportingPageSagas(),
    ...topSupportersPageSagas(),
    ...historySagas(),
    ...rewardsPageSagas(),
    ...settingsSagas(),
    ...aiSagas(),

    // Cast
    ...castSagas(),
    ...remixesSagas(),

    // Application
    ...addToPlaylistSagas(),
    ...relatedArtistsSagas(),
    ...changePasswordSagas(),
    ...smartCollectionPageSagas(),
    ...overflowMenuSagas(),
    ...rateCtaSagas(),
    ...deactivateAccountSagas(),
    ...deletePlaylistConfirmationModalSagas(),
    ...shareModalSagas(),
    ...vipDiscordModalSagas(),
    ...themeSagas(),
    ...tokenDashboardSagas(),
    ...uploadSagas(),
    ...remixSettingsSagas(),
    ...offlineDownloadSagas(),
    ...reachabilitySagas(),
    ...searchSagas(),
    ...publishPlaylistConfirmationModalSagas(),
    ...toastSagas(),

    initKeyboardEvents,
    ...remoteConfig(),
    ...oauthSagas(),
    ...walletsSagas()
  ]

  yield* all(sagas.map(fork))
}
