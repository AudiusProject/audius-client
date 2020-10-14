import { fork } from 'redux-saga/effects'

import confirmerSagas from 'store/confirmer/sagas'
import backendSagas, { setupBackend } from 'store/backend/sagas'
import routingSagas from 'store/routing/sagas'

import discoverPageSagas from 'containers/discover-page/store/sagas'
import explorePageSagas from 'containers/explore-page/store/sagas'
import exploreCollectionsPageSagas from 'containers/explore-page/store/collections/sagas'
import searchPageSagas from 'containers/search-page/store/sagas'
import searchBarSagas from 'containers/search-bar/store/sagas'
import uploadSagas from 'containers/upload-page/store/sagas'
import profileSagas from 'containers/profile-page/store/sagas'
import signOnSaga from 'containers/sign-on/store/sagas'
import dashboardSagas from 'containers/artist-dashboard-page/store/sagas'
import savedSagas from 'containers/saved-page/store/sagas'
import historySagas from 'containers/history-page/store/sagas'
import collectionSagas from 'containers/collection-page/store/sagas'
import trackSagas from 'containers/track-page/store/sagas'
import remixesSagas from 'containers/remixes-page/store/sagas'
import deletedSagas from 'containers/deleted-page/store/sagas'
import notificationSagas from 'containers/notification/store/sagas'
import serviceSelectionSagas from 'containers/service-selection/store/sagas'
import passwordResetSagas from 'containers/password-reset/store/sagas'
import settingsSagas from 'containers/settings-page/store/sagas'
import repostPageSagas from 'containers/reposts-page/store/sagas'
import favoritePageSagas from 'containers/favorites-page/store/sagas'
import followingPageSagas from 'containers/following-page/store/sagas'
import followersPageSagas from 'containers/followers-page/store/sagas'
import notificationUsersPageSagas from 'containers/notification-users-page/store/sagas'
import smartCollectionPageSagas from 'containers/smart-collection/store/sagas'
import firstUploadModalSagas from 'containers/first-upload-modal/store/sagas'
import addToPlaylistSagas from 'containers/add-to-playlist/store/sagas'
import remixSettingsModalSagas from 'containers/remix-settings-modal/store/sagas'
import remoteConfigSagas from 'containers/remote-config/sagas'

import analyticsSagas from 'store/analytics/sagas'
import accountSagas from 'store/account/sagas'
import coreCacheSagas from 'store/cache/sagas'
import tracksSagas from 'store/cache/tracks/sagas'
import collectionsSagas from 'store/cache/collections/sagas'
import usersSagas from 'store/cache/users/sagas'
import socialSagas from 'store/social/sagas'
import cookieBannerSagas from 'store/application/ui/cookieBanner/sagas'

import queueSagas from 'store/queue/sagas'
import playerSagas from 'store/player/sagas'
import walletSagas from 'store/wallet/sagas'

import scrollLockSagas from 'store/application/ui/scrollLock/sagas'
import themeSagas from 'store/application/ui/theme/sagas'
import reachabilitySagas from 'store/reachability/sagas'
import userListModalSagas from 'store/application/ui/userListModal/sagas'
import stemUploadSagas from 'store/application/ui/stemsUpload/sagas'

import tokenDashboardSagas from 'store/token-dashboard/sagas'

import errorSagas from 'store/errors/sagas'

import { initInterface } from 'services/native-mobile-interface/helpers'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

export default function* rootSaga() {
  yield fork(setupBackend)
  const sagas = [].concat(
    // Config
    accountSagas(),
    confirmerSagas(),
    backendSagas(),
    analyticsSagas(),
    cookieBannerSagas(),
    routingSagas(),
    reachabilitySagas(),

    // Pages
    discoverPageSagas(),
    explorePageSagas(),
    exploreCollectionsPageSagas(),
    savedSagas(),
    historySagas(),
    searchPageSagas(),
    searchBarSagas(),
    uploadSagas(),
    profileSagas(),
    socialSagas(),
    dashboardSagas(),
    signOnSaga(),
    collectionSagas(),
    trackSagas(),
    notificationSagas(),
    serviceSelectionSagas(),
    passwordResetSagas(),
    settingsSagas(),

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

    // Application
    scrollLockSagas(),
    themeSagas(),
    repostPageSagas(),
    favoritePageSagas(),
    followingPageSagas(),
    followersPageSagas(),
    notificationUsersPageSagas(),
    userListModalSagas(),
    smartCollectionPageSagas(),
    firstUploadModalSagas(),
    addToPlaylistSagas(),
    remixSettingsModalSagas(),
    stemUploadSagas(),
    remixesSagas(),
    deletedSagas(),
    tokenDashboardSagas(),

    // Remote config
    remoteConfigSagas(),

    // Error
    errorSagas()
  )
  if (NATIVE_MOBILE) {
    sagas.push(initInterface)
  }
  yield sagas.map(fork)
}
