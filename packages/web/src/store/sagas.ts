import {
  castSagas,
  playerSagas as commonPlayerSagas,
  playbackPositionSagas,
  chatSagas,
  premiumContentSagas,
  remoteConfigSagas,
  deletePlaylistConfirmationModalUISagas as deletePlaylistConfirmationModalSagas,
  publishPlaylistConfirmationModalUISagas as publishPlaylistConfirmationModalSagas,
  mobileOverflowMenuUISagas as overflowMenuSagas,
  shareModalUISagas as shareModalSagas,
  toastSagas,
  vipDiscordModalSagas,
  reachabilitySagas as commonReachabilitySagas,
  searchUsersModalSagas,
  relatedArtistsSagas,
  solanaSagas
} from '@audius/common'
import { all, fork } from 'redux-saga/effects'

import addToPlaylistSagas from 'common/store/add-to-playlist/sagas'
import analyticsSagas from 'common/store/analytics/sagas'
import backendSagas from 'common/store/backend/sagas'
import collectionsSagas from 'common/store/cache/collections/sagas'
import coreCacheSagas from 'common/store/cache/sagas'
import tracksSagas from 'common/store/cache/tracks/sagas'
import usersSagas from 'common/store/cache/users/sagas'
import changePasswordSagas from 'common/store/change-password/sagas'
import confirmerSagas from 'common/store/confirmer/sagas'
import notificationSagas from 'common/store/notifications/sagas'
import aiSagas from 'common/store/pages/ai/sagas'
import rewardsPageSagas from 'common/store/pages/audio-rewards/sagas'
import transactionsPageSagas from 'common/store/pages/audio-transactions/sagas'
import collectionSagas from 'common/store/pages/collection/sagas'
import deactivateAccountSagas from 'common/store/pages/deactivate-account/sagas'
import exploreCollectionsPageSagas from 'common/store/pages/explore/exploreCollections/sagas'
import explorePageSagas from 'common/store/pages/explore/sagas'
import feedPageSagas from 'common/store/pages/feed/sagas'
import historySagas from 'common/store/pages/history/sagas'
import remixesSagas from 'common/store/pages/remixes-page/sagas'
import savedSagas from 'common/store/pages/saved/sagas'
import searchResultsSagas from 'common/store/pages/search-page/sagas'
import signOnSaga from 'common/store/pages/signon/sagas'
import trackPageSagas from 'common/store/pages/track/sagas'
import trendingPlaylistSagas from 'common/store/pages/trending-playlists/sagas'
import trendingUndergroundSagas from 'common/store/pages/trending-underground/sagas'
import trendingPageSagas from 'common/store/pages/trending/sagas'
import playerSagas from 'common/store/player/sagas'
import playlistLibrarySagas from 'common/store/playlist-library/sagas'
import playlistUpdatesSagas from 'common/store/playlist-updates/sagas'
import profileSagas from 'common/store/profile/sagas'
import queueSagas from 'common/store/queue/sagas'
import recoveryEmailSagas from 'common/store/recovery-email/sagas'
import remixSettingsSagas from 'common/store/remix-settings/sagas'
import searchAiBarSagas from 'common/store/search-ai-bar/sagas'
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
import firstUploadModalSagas from 'components/first-upload-modal/store/sagas'
import passwordResetSagas from 'components/password-reset/store/sagas'
import shareSoundToTikTokModalSagas from 'components/share-sound-to-tiktok-modal/store/sagas'
import dashboardSagas from 'pages/artist-dashboard-page/store/sagas'
import deletedSagas from 'pages/deleted-page/store/sagas'
import settingsSagas from 'pages/settings-page/store/sagas'
import accountSagas from 'store/account/sagas'
import webAnalyticsSagas from 'store/analytics/sagas'
import buyAudioSagas from 'store/application/ui/buy-audio/sagas'
import chatWebSagas from 'store/application/ui/chat/sagas'
import cookieBannerSagas from 'store/application/ui/cookieBanner/sagas'
import scrollLockSagas from 'store/application/ui/scrollLock/sagas'
import stemUploadSagas from 'store/application/ui/stemsUpload/sagas'
import themeSagas from 'store/application/ui/theme/sagas'
import userListModalSagas from 'store/application/ui/userListModal/sagas'
import errorSagas from 'store/errors/sagas'
import reachabilitySagas from 'store/reachability/sagas'
import routingSagas from 'store/routing/sagas'
import signOutSagas from 'store/sign-out/sagas'
import tokenDashboardSagas from 'store/token-dashboard/sagas'

import notificationSagasWeb from './notifications/sagas'

export default function* rootSaga() {
  const sagas = ([] as (() => Generator<any, void, any>)[]).concat(
    // Config
    analyticsSagas(),
    webAnalyticsSagas(),
    backendSagas(),
    confirmerSagas(),
    searchBarSagas(),
    searchAiBarSagas(),

    cookieBannerSagas(),
    reachabilitySagas(),
    routingSagas(),

    // Account
    accountSagas(),
    playlistLibrarySagas(),
    playlistUpdatesSagas(),
    recoveryEmailSagas(),
    signOutSagas(),

    // Pages
    aiSagas(),
    collectionSagas(),
    chatSagas(),
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
    transactionsPageSagas(),
    savedSagas(),
    searchResultsSagas(),
    settingsSagas(),
    signOnSaga(),
    socialSagas(),
    trackPageSagas(),
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
    commonPlayerSagas(),
    playbackPositionSagas(),
    queueSagas(),

    // Wallet
    walletSagas(),

    // Cast
    castSagas(),

    // Application
    addToPlaylistSagas(),
    relatedArtistsSagas(),
    buyAudioSagas(),
    changePasswordSagas(),
    chatWebSagas(),
    deactivateAccountSagas(),
    deletedSagas(),
    deletePlaylistConfirmationModalSagas(),
    favoritePageSagas(),
    firstUploadModalSagas(),
    followersPageSagas(),
    followingPageSagas(),
    supportingPageSagas(),
    topSupportersPageSagas(),
    relatedArtistsPageSagas(),
    mutualsPageSagas(),
    notificationUsersPageSagas(),
    remixesSagas(),
    remixSettingsSagas(),
    repostPageSagas(),
    scrollLockSagas(),
    shareModalSagas(),
    overflowMenuSagas(),
    toastSagas(),
    shareSoundToTikTokModalSagas(),
    smartCollectionPageSagas(),
    searchUsersModalSagas(),
    stemUploadSagas(),
    themeSagas(),
    tokenDashboardSagas(),
    userListModalSagas(),
    vipDiscordModalSagas(),
    commonReachabilitySagas(),
    publishPlaylistConfirmationModalSagas(),

    // Remote config
    remoteConfigSagas(),

    // Solana
    solanaSagas(),

    // Tipping
    tippingSagas(),
    solanaSagas(),

    // Premium content
    premiumContentSagas(),

    // Error
    errorSagas()
  )
  yield all(sagas.map(fork))
}
