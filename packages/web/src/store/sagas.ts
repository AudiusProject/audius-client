import {
  castSagas,
  remoteConfigSagas,
  deletePlaylistConfirmationModalUISagas as deletePlaylistConfirmationModalSagas,
  mobileOverflowMenuUISagas as overflowMenuSagas,
  shareModalUISagas as shareModalSagas,
  toastSagas
} from '@audius/common'
import { all, fork } from 'redux-saga/effects'

import accountSagas from 'common/store/account/sagas'
import analyticsSagas from 'common/store/analytics/sagas'
import backendSagas, { setupBackend } from 'common/store/backend/sagas'
import collectionsSagas from 'common/store/cache/collections/sagas'
import coreCacheSagas from 'common/store/cache/sagas'
import tracksSagas from 'common/store/cache/tracks/sagas'
import usersSagas from 'common/store/cache/users/sagas'
import confirmerSagas from 'common/store/confirmer/sagas'
import notificationSagas from 'common/store/notifications/sagas'
import exploreCollectionsPageSagas from 'common/store/pages/explore/exploreCollections/sagas'
import explorePageSagas from 'common/store/pages/explore/sagas'
import signOnSaga from 'common/store/pages/signon/sagas'
import trackSagas from 'common/store/pages/track/sagas'
import reachabilitySagas from 'common/store/reachability/sagas'
import recoveryEmailSagas from 'common/store/recovery-email/sagas'
import searchBarSagas from 'common/store/search-bar/sagas'
import serviceSelectionSagas from 'common/store/service-selection/sagas'
import signOutSagas from 'common/store/sign-out/sagas'
import artistRecommendationsSagas from 'common/store/ui/artist-recommendations/sagas'
import reactionSagas from 'common/store/ui/reactions/sagas'
import notificationUsersPageSagas from 'common/store/user-list/notifications/sagas'
import addToPlaylistSagas from 'components/add-to-playlist/store/sagas'
import changePasswordSagas from 'components/change-password/store/sagas'
import firstUploadModalSagas from 'components/first-upload-modal/store/sagas'
import passwordResetSagas from 'components/password-reset/store/sagas'
import remixSettingsModalSagas from 'components/remix-settings-modal/store/sagas'
import shareSoundToTikTokModalSagas from 'components/share-sound-to-tiktok-modal/store/sagas'
import dashboardSagas from 'pages/artist-dashboard-page/store/sagas'
import rewardsPageSagas from 'pages/audio-rewards-page/store/sagas'
import collectionSagas from 'pages/collection-page/store/sagas'
import deactivateAccountSagas from 'pages/deactivate-account-page/store/sagas'
import deletedSagas from 'pages/deleted-page/store/sagas'
import favoritePageSagas from 'pages/favorites-page/sagas'
import feedPageSagas from 'pages/feed-page/store/sagas'
import followersPageSagas from 'pages/followers-page/sagas'
import followingPageSagas from 'pages/following-page/sagas'
import historySagas from 'pages/history-page/store/sagas'
import mutualsPageSagas from 'pages/mutuals-page/sagas'
import profileSagas from 'pages/profile-page/sagas'
import remixesSagas from 'pages/remixes-page/store/sagas'
import repostPageSagas from 'pages/reposts-page/sagas'
import savedSagas from 'pages/saved-page/store/sagas'
import searchPageSagas from 'pages/search-page/store/sagas'
import settingsSagas from 'pages/settings-page/store/sagas'
import smartCollectionPageSagas from 'pages/smart-collection/store/sagas'
import supportingPageSagas from 'pages/supporting-page/sagas'
import topSupportersPageSagas from 'pages/top-supporters-page/sagas'
import trackLineupSagas from 'pages/track-page/store/lineups/tracks/sagas'
import trendingPageSagas from 'pages/trending-page/store/sagas'
import trendingPlaylistSagas from 'pages/trending-playlists/store/sagas'
import trendingUndergroundSagas from 'pages/trending-underground/store/sagas'
import uploadSagas from 'pages/upload-page/store/sagas'
import { initInterface } from 'services/native-mobile-interface/helpers'
import webAnalyticsSagas from 'store/analytics/sagas'
import buyAudioSagas from 'store/application/ui/buy-audio/sagas'
import cookieBannerSagas from 'store/application/ui/cookieBanner/sagas'
import scrollLockSagas from 'store/application/ui/scrollLock/sagas'
import stemUploadSagas from 'store/application/ui/stemsUpload/sagas'
import themeSagas from 'store/application/ui/theme/sagas'
import userListModalSagas from 'store/application/ui/userListModal/sagas'
import errorSagas from 'store/errors/sagas'
import oauthSagas from 'store/oauth/sagas'
import playerSagas from 'store/player/sagas'
import playlistLibrarySagas from 'store/playlist-library/sagas'
import queueSagas from 'store/queue/sagas'
import routingSagas from 'store/routing/sagas'
import socialSagas from 'store/social/sagas'
import solanaSagas from 'store/solana/sagas'
import tippingSagas from 'store/tipping/sagas'
import tokenDashboardSagas from 'store/token-dashboard/sagas'
import walletSagas from 'store/wallet/sagas'

import notificationSagasWeb from './notifications/sagas'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

export default function* rootSaga() {
  yield fork(setupBackend)
  const sagas = ([] as (() => Generator<any, void, any>)[]).concat(
    // Config
    analyticsSagas(),
    webAnalyticsSagas(),
    backendSagas(),
    confirmerSagas(),
    searchBarSagas(),

    cookieBannerSagas(),
    reachabilitySagas(),
    routingSagas(),

    // Account
    accountSagas(),
    playlistLibrarySagas(),
    recoveryEmailSagas(),
    signOutSagas(),

    // Pages
    collectionSagas(),
    dashboardSagas(),
    exploreCollectionsPageSagas(),
    explorePageSagas(),
    feedPageSagas(),
    historySagas(),
    notificationSagas(),
    notificationSagasWeb(),
    passwordResetSagas(),
    profileSagas(),
    reactionSagas(),
    rewardsPageSagas(),
    savedSagas(),
    searchPageSagas(),
    serviceSelectionSagas(),
    settingsSagas(),
    signOnSaga(),
    socialSagas(),
    trackSagas(),
    trackLineupSagas(),
    trendingPageSagas(),
    trendingPlaylistSagas(),
    trendingUndergroundSagas(),
    uploadSagas(),

    // Cache
    coreCacheSagas(),
    collectionsSagas(),
    tracksSagas(),
    usersSagas(),

    // Playback
    playerSagas(),
    queueSagas(),

    // Wallet
    walletSagas(),

    // Cast
    castSagas(),

    // Application
    addToPlaylistSagas(),
    artistRecommendationsSagas(),
    buyAudioSagas(),
    changePasswordSagas(),
    deactivateAccountSagas(),
    deletedSagas(),
    deletePlaylistConfirmationModalSagas(),
    favoritePageSagas(),
    firstUploadModalSagas(),
    followersPageSagas(),
    followingPageSagas(),
    supportingPageSagas(),
    topSupportersPageSagas(),
    mutualsPageSagas(),
    notificationUsersPageSagas(),
    remixesSagas(),
    remixSettingsModalSagas(),
    repostPageSagas(),
    scrollLockSagas(),
    shareModalSagas(),
    overflowMenuSagas(),
    toastSagas(),
    shareSoundToTikTokModalSagas(),
    smartCollectionPageSagas(),
    stemUploadSagas(),
    themeSagas(),
    tokenDashboardSagas(),
    userListModalSagas(),
    oauthSagas(),

    // Remote config
    remoteConfigSagas(),

    // Solana
    solanaSagas(),

    // Tipping
    tippingSagas(),

    // Error
    errorSagas()
  )
  if (NATIVE_MOBILE) {
    sagas.push(initInterface)
  }
  yield all(sagas.map(fork))
}
