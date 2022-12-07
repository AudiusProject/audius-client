import {
  Kind,
  accountSelectors,
  cacheActions,
  profilePageActions,
  solanaSelectors,
  accountActions,
  recordIP,
  createUserBankIfNeeded
} from '@audius/common'
import {
  call,
  put,
  fork,
  select,
  takeEvery,
  getContext
} from 'redux-saga/effects'

import { identify } from 'common/store/analytics/actions'
import { retrieveCollections } from 'common/store/cache/collections/utils'
import { addPlaylistsNotInLibrary } from 'common/store/playlist-library/sagas'
import { updateProfileAsync } from 'common/store/profile/sagas'
import { waitForWrite, waitForRead } from 'utils/sagaHelpers'

import disconnectedWallets from './disconnected_wallet_fix.json'

const { getFeePayer } = solanaSelectors
const { fetchProfile } = profilePageActions

const {
  getUserId,
  getUserHandle,
  getAccountUser,
  getAccountAlbumIds,
  getAccountSavedPlaylistIds,
  getAccountOwnedPlaylistIds,
  getAccountToCache
} = accountSelectors

const {
  signedIn,
  unsubscribeBrowserPushNotifications,
  showPushNotificationConfirmation,
  fetchAccountSucceeded,
  fetchAccountFailed,
  fetchAccount,
  fetchLocalAccount,
  twitterLogin,
  instagramLogin,
  fetchSavedAlbums,
  fetchSavedPlaylists,
  addAccountPlaylist
} = accountActions

const IP_STORAGE_KEY = 'user-ip-timestamp'

/**
 * Sets the sentry user so that alerts are tied to a user
 * @param user
 * @param traits an object of any key-value traits to associate with the user
 */
const setSentryUser = (sentry, user, traits) => {
  if (traits.isVerified) {
    sentry.setTag('isVerified', `${traits.isVerified}`)
  }
  sentry.configureScope((currentScope) => {
    currentScope.setUser({
      id: `${user.user_id}`,
      username: user.handle,
      ...traits
    })
  })
}

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
function* onSignedIn({ payload: { account, isSignUp = false } }) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const analytics = yield getContext('analytics')
  const sentry = yield getContext('sentry')
  if (account && account.handle) {
    // Set analytics user context
    const traits = {
      isVerified: account.is_verified,
      trackCount: account.track_count
    }
    yield put(identify(account.handle, traits))
    setSentryUser(sentry, account, traits)
  }

  yield put(showPushNotificationConfirmation())

  yield fork(audiusBackendInstance.updateUserLocationTimezone)

  // Fetch the profile so we get everything we need to populate
  // the left nav / other site-wide metadata.
  yield put(
    fetchProfile(account.handle, account.user_id, false, false, false, true)
  )

  // Add playlists that might not have made it into the user's library.
  // This could happen if the user creates a new playlist and then leaves their session.
  yield fork(addPlaylistsNotInLibrary)

  const feePayerOverride = yield select(getFeePayer)
  yield call(
    createUserBankIfNeeded,
    analytics.track,
    audiusBackendInstance,
    feePayerOverride
  )
  if (!isSignUp) {
    yield call(
      createUserBankIfNeeded,
      analytics.track,
      audiusBackendInstance,
      feePayerOverride
    )
  }

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
        audiusBackendInstance.fetchCID,
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

export function* fetchAccountAsync({ isSignUp = false }) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const remoteConfigInstance = yield getContext('remoteConfigInstance')
  const localStorage = yield getContext('localStorage')
  const isNativeMobile = yield getContext('isNativeMobile')
  const isElectron = yield getContext('isElectron')
  const fingerprintClient = yield getContext('fingerprintClient')

  yield put(accountActions.fetchAccountRequested())

  const account = yield call(audiusBackendInstance.getAccount)
  if (!account) {
    yield put(
      fetchAccountFailed({
        reason: 'ACCOUNT_NOT_FOUND'
      })
    )
    return
  }
  if (account.is_deactivated) {
    yield put(
      fetchAccountFailed({
        reason: 'ACCOUNT_DEACTIVATED'
      })
    )
    return
  }

  // Set the userId in the remoteConfigInstance
  remoteConfigInstance.setUserId(account.user_id)

  // Fire-and-forget fp identify
  const clientOrigin = isNativeMobile
    ? 'mobile'
    : isElectron
    ? 'desktop'
    : 'web'
  fingerprintClient.identify(account.user_id, clientOrigin)

  yield call(recordIPIfNotRecent, account.handle)

  // Cache the account and put the signedIn action. We're done.
  yield call(cacheAccount, account)
  yield put(signedIn({ account, isSignUp }))
}

export function* fetchLocalAccountAsync() {
  const localStorage = yield getContext('localStorage')

  yield put(accountActions.fetchAccountRequested())

  const cachedAccount = yield call([localStorage, 'getAudiusAccount'])
  const cachedAccountUser = yield call([localStorage, 'getAudiusAccountUser'])
  const currentUserExists = yield call([localStorage, 'getCurrentUserExists'])
  if (cachedAccount && cachedAccountUser && !cachedAccountUser.is_deactivated) {
    yield call(
      cacheAccount,
      cachedAccountUser,
      cachedAccountUser.orderedPlaylists
    )
  } else if (!currentUserExists) {
    yield put(fetchAccountFailed({ reason: 'ACCOUNT_NOT_FOUND' }))
  }
}

function* cacheAccount(account) {
  const localStorage = yield getContext('localStorage')
  const collections = account.playlists || []

  yield put(
    cacheActions.add(Kind.USERS, [
      { id: account.user_id, uid: 'USER_ACCOUNT', metadata: account }
    ])
  )

  const formattedAccount = {
    userId: account.user_id,
    collections
  }

  yield call([localStorage, 'setAudiusAccount'], formattedAccount)
  yield call([localStorage, 'setAudiusAccountUser'], account)

  yield put(fetchAccountSucceeded(formattedAccount))
}

// Pull from redux cache and persist to local storage cache
export function* reCacheAccount() {
  const localStorage = yield getContext('localStorage')
  const account = yield select(getAccountToCache)
  const accountUser = yield select(getAccountUser)

  yield call([localStorage, 'setAudiusAccount'], account)
  yield call([localStorage, 'setAudiusAccountUser'], accountUser)
}

function* associateTwitterAccount(action) {
  const { uuid, profile } = action.payload
  yield waitForWrite()
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  try {
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
  yield waitForRead()
  const cachedSavedAlbums = yield select(getAccountAlbumIds)
  if (cachedSavedAlbums.length > 0) {
    yield call(retrieveCollections, null, cachedSavedAlbums)
  }
}

function* fetchSavedPlaylistsAsync() {
  yield waitForRead()

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
  yield takeEvery(fetchAccount.type, fetchAccountAsync)
}

function* watchFetchLocalAccount() {
  yield takeEvery(fetchLocalAccount.type, fetchLocalAccountAsync)
}

function* watchSignedIn() {
  yield takeEvery(signedIn.type, onSignedIn)
}

function* watchTwitterLogin() {
  yield takeEvery(twitterLogin.type, associateTwitterAccount)
}

function* watchInstagramLogin() {
  yield takeEvery(instagramLogin.type, associateInstagramAccount)
}

function* watchFetchSavedAlbums() {
  yield takeEvery(fetchSavedAlbums.type, fetchSavedAlbumsAsync)
}

function* watchFetchSavedPlaylists() {
  yield takeEvery(fetchSavedPlaylists.type, fetchSavedPlaylistsAsync)
}

function* watchAddAccountPlaylist() {
  yield takeEvery(addAccountPlaylist.type, reCacheAccount)
}

export default function sagas() {
  return [
    watchFetchAccount,
    watchFetchLocalAccount,
    watchSignedIn,
    watchTwitterLogin,
    watchInstagramLogin,
    watchFetchSavedAlbums,
    watchFetchSavedPlaylists,
    watchAddAccountPlaylist
  ]
}
