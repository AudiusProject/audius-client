import { Kind, Status, USER_ID_AVAILABLE_EVENT } from '@audius/common'
import {
  call,
  put,
  fork,
  select,
  takeEvery,
  getContext
} from 'redux-saga/effects'

import * as accountActions from 'common/store/account/reducer'
import {
  getUserId,
  getUserHandle,
  getAccountUser,
  getAccountAlbumIds,
  getAccountSavedPlaylistIds,
  getAccountOwnedPlaylistIds,
  getAccountToCache
} from 'common/store/account/selectors'
import { identify } from 'common/store/analytics/actions'
import { waitForBackendSetup } from 'common/store/backend/sagas'
import * as cacheActions from 'common/store/cache/actions'
import { retrieveCollections } from 'common/store/cache/collections/utils'
import { fetchProfile } from 'common/store/pages/profile/actions'
import {
  setBrowserNotificationPermission,
  setBrowserNotificationEnabled,
  setBrowserNotificationSettingsOn
} from 'common/store/pages/settings/actions'
import { getFeePayer } from 'common/store/solana/selectors'
import { setVisibility } from 'common/store/ui/modals/slice'
import { waitForAccount, waitForValue } from 'common/utils/sagaHelpers'
import { updateProfileAsync } from 'pages/profile-page/sagas'
import { fetchCID } from 'services/audius-backend'
import { recordIP } from 'services/audius-backend/RecordIP'
import { createUserBankIfNeeded } from 'services/audius-backend/waudio'
import { fingerprintClient } from 'services/fingerprint'
import { SignedIn } from 'services/native-mobile-interface/lifecycle'
import { setSentryUser } from 'services/sentry'
import { addPlaylistsNotInLibrary } from 'store/playlist-library/sagas'
import {
  Permission,
  isPushManagerAvailable,
  isSafariPushAvailable,
  unsubscribePushManagerBrowser,
  getPushManagerPermission,
  getPushManagerBrowserSubscription,
  getSafariPushBrowser,
  subscribePushManagerBrowser,
  setHasRequestedBrowserPermission,
  removeHasRequestedBrowserPermission,
  shouldRequestBrowserPermission
} from 'utils/browserNotifications'
import { isMobile, isElectron } from 'utils/clientUtil'

import disconnectedWallets from './disconnected_wallet_fix.json'
import mobileSagas, { setHasSignedInOnMobile } from './mobileSagas'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const IP_STORAGE_KEY = 'user-ip-timestamp'

function* recordIPIfNotRecent(handle) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const localStorage = yield getContext('localStorage')
  const timeBetweenRefresh = 24 * 60 * 60 * 1000
  const now = Date.now()
  const minAge = now - timeBetweenRefresh
  const storedIPStr = yield call([localStorage, 'getItem'], IP_STORAGE_KEY)
  const storedIP = storedIPStr && JSON.parse(storedIPStr)
  if (!storedIP || !storedIP[handle] || storedIP[handle].timestamp < minAge) {
    const { userIP, error } = yield call(recordIP, audiusBackendInstance)
    if (!error) {
      yield call(
        [localStorage, 'setItem'],
        IP_STORAGE_KEY,
        JSON.stringify({ ...storedIP, [handle]: { userIP, timestamp: now } })
      )
    }
  }
}

// Tasks to be run on account successfully fetched, e.g.
// recording metrics, setting user data
function* onFetchAccount(account) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const isNativeMobile = yield getContext('isNativeMobile')
  if (account && account.handle) {
    // Set analytics user context
    const traits = {
      isVerified: account.is_verified,
      trackCount: account.track_count
    }
    yield put(identify(account.handle, traits))
    setSentryUser(account, traits)
  }

  if (!isNativeMobile && shouldRequestBrowserPermission()) {
    setHasRequestedBrowserPermission()
    yield put(accountActions.showPushNotificationConfirmation())
  }

  yield fork(audiusBackendInstance.updateUserLocationTimezone)
  if (NATIVE_MOBILE) {
    yield fork(setHasSignedInOnMobile, account)
    new SignedIn(account).send()
  }

  // Fetch the profile so we get everything we need to populate
  // the left nav / other site-wide metadata.
  yield put(
    fetchProfile(account.handle, account.user_id, false, false, false, true)
  )

  // Add playlists that might not have made it into the user's library.
  // This could happen if the user creates a new playlist and then leaves their session.
  yield fork(addPlaylistsNotInLibrary)

  const feePayerOverride = yield select(getFeePayer)
  yield call(createUserBankIfNeeded, feePayerOverride)

  // Repair users from flare-101 that were impacted and lost connected wallets
  // TODO: this should be removed after sufficient time has passed or users have gotten
  // reconnected.
  if (account.user_id in disconnectedWallets) {
    const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
      account.creator_node_endpoint
    )
    const cid = account.metadata_multihash ?? null
    if (cid) {
      const contentNodeMetadata = yield call(
        fetchCID,
        cid,
        gateways,
        /* cache */ false,
        /* asUrl */ false
      )
      const newMetadata = {
        ...account
      }
      let requiresUpdate = false
      if (
        contentNodeMetadata.associated_wallets === null &&
        disconnectedWallets[account.user_id].associated_wallets !== null
      ) {
        requiresUpdate = true
        newMetadata.associated_wallets =
          disconnectedWallets[account.user_id].associated_wallets
      }
      if (
        contentNodeMetadata.associated_sol_wallets === null &&
        disconnectedWallets[account.user_id].associated_sol_wallets !== null
      ) {
        requiresUpdate = true
        newMetadata.associated_sol_wallets =
          disconnectedWallets[account.user_id].associated_sol_wallets
      }
      if (requiresUpdate) {
        yield fork(updateProfileAsync, { metadata: newMetadata })
      }
    }
  }
}

export function* fetchAccountAsync(action) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const remoteConfigInstance = yield getContext('remoteConfigInstance')
  const localStorage = yield getContext('localStorage')
  const isNativeMobile = yield getContext('isNativeMobile')

  let fromSource = false
  if (action) {
    fromSource = action.fromSource
  }
  yield put(accountActions.fetchAccountRequested())

  if (!fromSource) {
    const cachedAccount = yield call([localStorage, 'getAudiusAccount'])
    const cachedAccountUser = yield call([localStorage, 'getAudiusAccountUser'])
    const currentUserExists = yield call([localStorage, 'getCurrentUserExists'])
    if (
      cachedAccount &&
      cachedAccountUser &&
      !cachedAccountUser.is_deactivated
    ) {
      yield call(
        cacheAccount,
        cachedAccountUser,
        cachedAccountUser.orderedPlaylists
      )
      yield put(accountActions.fetchAccountSucceeded(cachedAccount))
    } else if (!currentUserExists) {
      yield put(
        accountActions.fetchAccountFailed({ reason: 'ACCOUNT_NOT_FOUND' })
      )
    }
  }

  const account = yield call(audiusBackendInstance.getAccount, fromSource)
  if (!account || account.is_deactivated) {
    yield put(
      accountActions.fetchAccountFailed({
        reason: account ? 'ACCOUNT_DEACTIVATED' : 'ACCOUNT_NOT_FOUND'
      })
    )
    // Clear local storage users if present
    yield call([localStorage, 'clearAudiusAccount'])
    yield call([localStorage, 'clearAudiusAccountUser'])
    // If the user is not signed in
    // Remove browser has requested push notifications.
    if (!isNativeMobile) {
      removeHasRequestedBrowserPermission()
      const browserPushSubscriptionStatus = yield call(
        fetchBrowserPushNotifcationStatus
      )
      if (
        browserPushSubscriptionStatus === Permission.GRANTED &&
        isPushManagerAvailable
      ) {
        const subscription = yield call(getPushManagerBrowserSubscription)
        yield call(audiusBackendInstance.disableBrowserNotifications, {
          subscription
        })
      } else if (
        browserPushSubscriptionStatus === Permission.GRANTED &&
        isSafariPushAvailable
      ) {
        const safariSubscription = yield call(getSafariPushBrowser)
        if (safariSubscription.permission === Permission.GRANTED) {
          yield call(
            audiusBackendInstance.deregisterDeviceToken,
            safariSubscription.deviceToken
          )
        }
      }
    }
    return
  }

  // Set account ID and let remote-config provider
  // know that the user id is available
  remoteConfigInstance.setUserId(account.user_id)
  const event = new CustomEvent(USER_ID_AVAILABLE_EVENT)
  window.dispatchEvent(event)

  // Fire-and-forget fp identify
  fingerprintClient.identify(account.user_id)

  yield call(recordIPIfNotRecent, account.handle)

  // Cache the account and fire the onFetch callback. We're done.
  yield call(cacheAccount, account)
  yield call(onFetchAccount, account)
}

function* cacheAccount(account) {
  const localStorage = yield getContext('localStorage')
  const collections = account.playlists || []

  yield put(
    cacheActions.add(Kind.USERS, [
      { id: account.user_id, uid: 'USER_ACCOUNT', metadata: account }
    ])
  )

  const hasFavoritedItem =
    collections.some((playlist) => playlist.user.id !== account.user_id) ||
    account.track_save_count > 0

  const formattedAccount = {
    userId: account.user_id,
    collections,
    hasFavoritedItem
  }

  yield call([localStorage, 'setAudiusAccount'], formattedAccount)
  yield call([localStorage, 'setAudiusAccountUser'], account)

  yield put(accountActions.fetchAccountSucceeded(formattedAccount))
}

// Pull from redux cache and persist to local storage cache
export function* reCacheAccount() {
  const localStorage = yield getContext('localStorage')
  const account = yield select(getAccountToCache)
  const accountUser = yield select(getAccountUser)

  yield call([localStorage, 'setAudiusAccount'], account)
  yield call([localStorage, 'setAudiusAccountUser'], accountUser)
}

const setBrowerPushPermissionConfirmationModal = setVisibility({
  modal: 'BrowserPushPermissionConfirmation',
  visible: true
})

/**
 * Determine if the push notification modal should appear
 */
export function* showPushNotificationConfirmation() {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  if (isMobile() || isElectron()) return
  const account = yield select(getAccountUser)
  if (!account) return
  const browserPermission = yield call(fetchBrowserPushNotifcationStatus)
  if (browserPermission === Permission.DEFAULT) {
    yield put(setBrowerPushPermissionConfirmationModal)
  } else if (browserPermission === Permission.GRANTED) {
    if (isPushManagerAvailable) {
      const subscription = yield call(getPushManagerBrowserSubscription)
      const enabled = yield call(
        audiusBackendInstance.getBrowserPushSubscription,
        subscription.endpoint
      )
      if (!enabled) {
        yield put(setBrowerPushPermissionConfirmationModal)
      }
    } else if (isSafariPushAvailable) {
      try {
        const safariPushBrowser = yield call(getSafariPushBrowser)
        const enabled = yield call(
          audiusBackendInstance.getBrowserPushSubscription,
          safariPushBrowser.deviceToken
        )
        if (!enabled) {
          yield put(setBrowerPushPermissionConfirmationModal)
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}

export function* fetchBrowserPushNotifcationStatus() {
  if (isElectron() || isMobile()) return
  if (isPushManagerAvailable) {
    const permission = yield call(getPushManagerPermission)
    return permission
  } else if (isSafariPushAvailable) {
    const safariSubscription = yield call(getSafariPushBrowser)
    return safariSubscription.permission
  }
}

export function* subscribeBrowserPushNotifcations() {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  if (isPushManagerAvailable) {
    const pushManagerSubscription = yield call(
      getPushManagerBrowserSubscription
    )
    if (pushManagerSubscription) {
      yield put(setBrowserNotificationPermission(Permission.GRANTED))
      yield put(setBrowserNotificationEnabled(true, false))
      yield call(audiusBackendInstance.updateBrowserNotifications, {
        subscription: pushManagerSubscription
      })
      yield put(setBrowserNotificationSettingsOn())
    } else if (
      window.Notification &&
      window.Notification.permission !== Permission.DENIED
    ) {
      const subscription = yield call(subscribePushManagerBrowser)
      const enabled = !!subscription
      if (enabled) {
        yield put(setBrowserNotificationPermission(Permission.GRANTED))
        yield put(setBrowserNotificationEnabled(true, false))
        yield call(audiusBackendInstance.updateBrowserNotifications, {
          subscription
        })
      } else {
        yield put(setBrowserNotificationPermission(Permission.DENIED))
      }
    }
  }
  // Note: you cannot request safari permission from saga
  // it must be initiated from a user action (in the component)
  if (isSafariPushAvailable) {
    const safariSubscription = yield call(getSafariPushBrowser)
    if (safariSubscription.permission === Permission.GRANTED) {
      yield call(
        audiusBackendInstance.registerDeviceToken,
        safariSubscription.deviceToken,
        'safari'
      )
      yield put(setBrowserNotificationEnabled(true, false))
      yield put(setBrowserNotificationSettingsOn())
    }
  }
}

export function* unsubscribeBrowserPushNotifcations() {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  if (isPushManagerAvailable) {
    const pushManagerSubscription = yield call(unsubscribePushManagerBrowser)
    if (pushManagerSubscription) {
      yield call(audiusBackendInstance.disableBrowserNotifications, {
        subscription: pushManagerSubscription
      })
    }
  } else if (isSafariPushAvailable) {
    const safariSubscription = yield call(getSafariPushBrowser)
    if (safariSubscription.premission === Permission.GRANTED) {
      yield call(
        audiusBackendInstance.deregisterDeviceToken(
          safariSubscription.deviceToken
        )
      )
    }
  }
}

function* associateTwitterAccount(action) {
  const { uuid, profile } = action.payload
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  try {
    yield waitForAccount()
    const userId = yield select(getUserId)
    const handle = yield select(getUserHandle)
    yield call(
      audiusBackendInstance.associateTwitterAccount,
      uuid,
      userId,
      handle
    )

    const account = yield select(getAccountUser)
    const { verified } = profile
    if (!account.is_verified && verified) {
      yield put(
        cacheActions.update(Kind.USERS, [
          { id: userId, metadata: { is_verified: true } }
        ])
      )
    }
  } catch (err) {
    console.error(err.message)
  }
}

function* associateInstagramAccount(action) {
  const { uuid, profile } = action.payload
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  try {
    const userId = yield select(getUserId)
    const handle = yield select(getUserHandle)
    yield call(
      audiusBackendInstance.associateInstagramAccount,
      uuid,
      userId,
      handle
    )

    const account = yield select(getAccountUser)
    const { is_verified: verified } = profile
    if (!account.is_verified && verified) {
      yield put(
        cacheActions.update(Kind.USERS, [
          { id: userId, metadata: { is_verified: true } }
        ])
      )
    }
  } catch (err) {
    console.error(err.message)
  }
}

function* fetchSavedAlbumsAsync() {
  yield call(waitForBackendSetup)
  const isAccountSet = (store) => store.account.status
  yield call(
    waitForValue,
    isAccountSet,
    null,
    (status) => status === Status.SUCCESS
  )
  const cachedSavedAlbums = yield select(getAccountAlbumIds)
  if (cachedSavedAlbums.length > 0) {
    yield call(retrieveCollections, null, cachedSavedAlbums)
  }
}

function* fetchSavedPlaylistsAsync() {
  yield call(waitForBackendSetup)
  const isAccountSet = (store) => store.account.status
  yield call(
    waitForValue,
    isAccountSet,
    null,
    (status) => status === Status.SUCCESS
  )

  // Fetch other people's playlists you've saved
  yield fork(function* () {
    const savedPlaylists = yield select(getAccountSavedPlaylistIds)
    if (savedPlaylists.length > 0) {
      yield call(retrieveCollections, null, savedPlaylists)
    }
  })

  // Fetch your own playlists
  yield fork(function* () {
    const ownPlaylists = yield select(getAccountOwnedPlaylistIds)
    if (ownPlaylists.length > 0) {
      yield call(retrieveCollections, null, ownPlaylists)
    }
  })
}

function* watchFetchAccount() {
  yield takeEvery(accountActions.fetchAccount.type, fetchAccountAsync)
}

function* watchTwitterLogin() {
  yield takeEvery(accountActions.twitterLogin.type, associateTwitterAccount)
}

function* watchInstagramLogin() {
  yield takeEvery(accountActions.instagramLogin.type, associateInstagramAccount)
}

function* watchFetchSavedAlbums() {
  yield takeEvery(accountActions.fetchSavedAlbums.type, fetchSavedAlbumsAsync)
}

function* watchFetchSavedPlaylists() {
  yield takeEvery(
    accountActions.fetchSavedPlaylists.type,
    fetchSavedPlaylistsAsync
  )
}

function* watchAddAccountPlaylist() {
  yield takeEvery(accountActions.addAccountPlaylist.type, reCacheAccount)
}

function* getBrowserPushNotifcations() {
  yield takeEvery(
    accountActions.fetchBrowserPushNotifications.type,
    fetchBrowserPushNotifcationStatus
  )
}

function* watchShowPushNotificationConfirmation() {
  yield takeEvery(
    accountActions.showPushNotificationConfirmation.type,
    showPushNotificationConfirmation
  )
}

function* subscribeBrowserPushNotification() {
  yield takeEvery(
    accountActions.subscribeBrowserPushNotifications.type,
    subscribeBrowserPushNotifcations
  )
}

function* unsubscribeBrowserPushNotification() {
  yield takeEvery(
    accountActions.unsubscribeBrowserPushNotifications.type,
    unsubscribeBrowserPushNotifcations
  )
}

export default function sagas() {
  const sagas = [
    watchFetchAccount,
    watchTwitterLogin,
    watchInstagramLogin,
    watchFetchSavedAlbums,
    watchFetchSavedPlaylists,
    watchShowPushNotificationConfirmation,
    watchAddAccountPlaylist,
    getBrowserPushNotifcations,
    subscribeBrowserPushNotification,
    unsubscribeBrowserPushNotification
  ]
  return NATIVE_MOBILE ? sagas.concat(mobileSagas()) : sagas
}
