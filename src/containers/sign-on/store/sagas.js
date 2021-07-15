/* globals fetch */
import { push as pushRoute } from 'connected-react-router'
import { delay } from 'redux-saga'
import {
  all,
  call,
  fork,
  put,
  race,
  select,
  take,
  takeEvery,
  takeLatest
} from 'redux-saga/effects'

import { getIGUserUrl } from 'components/general/InstagramAuth'
import AudiusBackend from 'services/AudiusBackend'
import { getCityAndRegion } from 'services/Location'
import { Name } from 'services/analytics'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { getRemoteVar, IntKeys, StringKeys } from 'services/remote-config'
import * as accountActions from 'store/account/reducer'
import { fetchAccountAsync } from 'store/account/sagas'
import { identify, make } from 'store/analytics/actions'
import * as backendActions from 'store/backend/actions'
import { waitForBackendSetup } from 'store/backend/sagas'
import { fetchUserByHandle, fetchUsers } from 'store/cache/users/sagas'
import { processAndCacheUsers } from 'store/cache/users/utils'
import * as confirmerActions from 'store/confirmer/actions'
import { confirmTransaction } from 'store/confirmer/sagas'
import * as socialActions from 'store/social/users/actions'
import { setHasRequestedBrowserPermission } from 'utils/browserNotifications'
import { isValidEmailString } from 'utils/email'
import { ELECTRONIC_SUBGENRES, Genre } from 'utils/genres'
import { withTimeout } from 'utils/network'
import { restrictedHandles } from 'utils/restrictedHandles'
import { FEED_PAGE, SIGN_IN_PAGE, SIGN_UP_PAGE } from 'utils/route'

import { MAX_HANDLE_LENGTH } from '../utils/formatSocialProfile'

import * as signOnActions from './actions'
import { watchSignOnError } from './errorSagas'
import { getRouteOnCompletion, getSignOn } from './selectors'
import { FollowArtistsCategory, Pages } from './types'
import { checkHandle } from './verifiedChecker'

const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production'
const IS_PRODUCTION = process.env.REACT_APP_ENVIRONMENT === 'production'
const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

const SUGGESTED_FOLLOW_USER_HANDLE_URL =
  process.env.REACT_APP_SUGGESTED_FOLLOW_HANDLES ||
  'https://download.audius.co/static-resources/signup-follows.json'
const SIGN_UP_TIMEOUT_MILLIS = 20 /* min */ * 60 * 1000

const messages = {
  incompleteAccount:
    'Oops, it looks like your account was never fully completed!'
}

// Users ID to filter out of the suggested artists to follow list and to follow by default
/* user id 51: official audius account */
const defaultFollowUserIds = new Set([51])

export const fetchSuggestedFollowUserIds = async () => {
  return fetch(SUGGESTED_FOLLOW_USER_HANDLE_URL).then(d => d.json())
}

const followArtistCategoryGenreMappings = {
  [FollowArtistsCategory.ALL_GENRES]: [],
  [FollowArtistsCategory.ELECTRONIC]: [FollowArtistsCategory.ELECTRONIC].concat(
    Object.keys(ELECTRONIC_SUBGENRES)
  ),
  [FollowArtistsCategory.HIP_HOP_RAP]: [Genre.HIP_HOP_RAP],
  [FollowArtistsCategory.ALTERNATIVE]: [Genre.ALTERNATIVE],
  [FollowArtistsCategory.POP]: [Genre.POP]
}

function* fetchAllFollowArtist() {
  yield call(waitForBackendSetup)
  // Fetch Featured Follow artists first
  const suggestedUserFollowIds = yield call(fetchSuggestedFollowUserIds)
  yield call(fetchUsers, suggestedUserFollowIds)
  yield put(
    signOnActions.fetchFollowArtistsSucceeded(
      FollowArtistsCategory.FEATURED,
      suggestedUserFollowIds
    )
  )
  yield all(
    Object.keys(followArtistCategoryGenreMappings).map(fetchFollowArtistGenre)
  )
}

function* fetchFollowArtistGenre(followArtistCategory) {
  const genres = followArtistCategoryGenreMappings[followArtistCategory]
  try {
    const users = yield apiClient.getTopArtistGenres({
      genres,
      limit: 31,
      offset: 0
    })
    const userOptions = users
      .filter(user => !defaultFollowUserIds.has(user.user_id))
      .slice(0, 30)

    yield call(processAndCacheUsers, userOptions)
    const userIds = userOptions.map(({ user_id: id }) => id)
    yield put(
      signOnActions.fetchFollowArtistsSucceeded(followArtistCategory, userIds)
    )
  } catch (err) {
    yield put(signOnActions.fetchFollowArtistsFailed(err))
  }
}

function* fetchReferrer(action) {
  const { location } = action
  const handle = new URLSearchParams(location.search).get('ref')
  try {
    const user = yield call(fetchUserByHandle, handle)
    if (!user) return
    yield put(signOnActions.setReferrer(user.user_id))
  } catch (e) {
    console.error(e)
  }
}

const isRestrictedHandle = handle => restrictedHandles.has(handle.toLowerCase())
const isHandleCharacterCompliant = handle => /^[a-zA-Z0-9_]*$/.test(handle)

async function getInstagramUser(handle) {
  try {
    const profileEndpoint =
      getRemoteVar(StringKeys.INSTAGRAM_API_PROFILE_URL) ||
      'https://instagram.com/$USERNAME$/?__a=1'
    const timeout = getRemoteVar(IntKeys.INSTAGRAM_HANDLE_CHECK_TIMEOUT) || 4000
    const fetchIGUserUrl = getIGUserUrl(profileEndpoint, handle)
    const igProfile = await withTimeout(fetch(fetchIGUserUrl), timeout)
    if (!igProfile.ok) return null
    const igProfileJson = await igProfile.json()
    if (!igProfileJson.graphql || !igProfileJson.graphql.user) {
      return null
    }
    const fields = ['username', 'is_verified']
    return fields.reduce((profile, field) => {
      profile[field] = igProfileJson.graphql.user[field]
      return profile
    }, {})
  } catch (err) {
    return null
  }
}

function* validateHandle(action) {
  const { handle, onValidate } = action
  yield call(waitForBackendSetup)
  try {
    if (handle.length > MAX_HANDLE_LENGTH) {
      yield put(signOnActions.validateHandleFailed('tooLong'))
      if (onValidate) onValidate(true)
      return
    } else if (!isHandleCharacterCompliant(handle)) {
      yield put(signOnActions.validateHandleFailed('characters'))
      if (onValidate) onValidate(true)
      return
    } else if (isRestrictedHandle(handle)) {
      yield put(signOnActions.validateHandleFailed('inUse'))
      if (onValidate) onValidate(true)
      return
    }
    yield delay(300) // Wait 300 ms to debounce user input
    const signOn = yield select(getSignOn)
    const verified = signOn.verified

    let handleInUse
    if (IS_PRODUCTION_BUILD || IS_PRODUCTION) {
      const [inUse, twitterUserQuery, instagramUser] = yield all([
        call(AudiusBackend.handleInUse, handle),
        call(AudiusBackend.twitterHandle, handle),
        call(getInstagramUser, handle)
      ])
      const handleCheckStatus = checkHandle(
        verified,
        twitterUserQuery?.user?.profile?.[0] ?? null,
        instagramUser || null
      )

      if (handleCheckStatus !== 'notReserved') {
        yield put(signOnActions.validateHandleFailed(handleCheckStatus))
        if (onValidate) onValidate(true)
        return
      }
      handleInUse = inUse
    } else {
      handleInUse = yield call(AudiusBackend.handleInUse, handle)
    }

    if (handleInUse) {
      yield put(signOnActions.validateHandleFailed('inUse'))
      if (onValidate) onValidate(true)
    } else {
      yield put(signOnActions.validateHandleSucceeded())
      if (onValidate) onValidate(false)
    }
  } catch (err) {
    yield put(signOnActions.validateHandleFailed(err.message))
    if (onValidate) onValidate(true)
  }
}

function* validateEmail(action) {
  yield call(waitForBackendSetup)
  try {
    if (!isValidEmailString(action.email)) {
      yield put(signOnActions.validateEmailFailed('characters'))
      return
    }
    const inUse = yield call(AudiusBackend.emailInUse, action.email)
    yield put(signOnActions.validateEmailSucceeded(!inUse))
  } catch (err) {
    yield put(signOnActions.validateEmailFailed(err.message))
  }
}

function* signUp(action) {
  yield call(waitForBackendSetup)
  const signOn = yield select(getSignOn)
  const location = yield call(getCityAndRegion)
  const createUserMetadata = {
    name: signOn.name.value,
    handle: signOn.handle.value,
    profilePicture: (signOn.profileImage && signOn.profileImage.file) || null,
    coverPhoto: (signOn.coverPhoto && signOn.coverPhoto.file) || null,
    isVerified: signOn.verified,
    location: location
  }

  const name = signOn.name.value
  const email = signOn.email.value
  const password = signOn.password.value
  const handle = signOn.handle.value
  const alreadyExisted = signOn.accountAlreadyExisted
  const referrer = signOn.referrer

  yield put(
    confirmerActions.requestConfirmation(
      handle,
      function* () {
        const { blockHash, blockNumber, userId, error, phase } = yield call(
          AudiusBackend.signUp,
          {
            email,
            password,
            formFields: createUserMetadata,
            hasWallet: alreadyExisted,
            referrer
          }
        )

        if (error) {
          yield put(signOnActions.signUpFailed(error, phase))
          return
        }

        if (!signOn.useMetaMask && signOn.twitterId) {
          const { error } = yield call(
            AudiusBackend.associateTwitterAccount,
            signOn.twitterId,
            userId,
            handle
          )
          if (error) {
            yield put(signOnActions.setTwitterProfileError(error))
          }
        }
        if (
          !signOn.useMetaMask &&
          signOn.instagramId &&
          handle.toLowerCase() ===
            (signOn.instagramScreenName || '').toLowerCase()
        ) {
          const { error } = yield call(
            AudiusBackend.associateInstagramAccount,
            handle.toLowerCase(),
            userId,
            handle
          )
          if (error) {
            yield put(signOnActions.setInstagramProfileError(error))
          }
        }

        yield put(
          identify(handle, {
            name,
            email,
            userId
          })
        )

        // Set the has request browser permission to true as the signon provider will open it
        setHasRequestedBrowserPermission()

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(`Could not confirm sign up for user id ${userId}`)
        }
        return yield call(AudiusBackend.getCreators, [userId])[0]
      },
      function* () {
        yield put(signOnActions.signUpSucceeded())
        yield call(fetchAccountAsync)
      },
      function* ({ timeout }) {
        if (timeout) {
          console.debug('Timed out trying to register')
          yield put(signOnActions.signUpTimeout())
        }
      },
      () => {},
      SIGN_UP_TIMEOUT_MILLIS
    )
  )
}

function* signIn(action) {
  yield call(waitForBackendSetup)
  try {
    const signOn = yield select(getSignOn)
    const signInResponse = yield call(
      AudiusBackend.signIn,
      signOn.email.value,
      signOn.password.value
    )
    if (
      !signInResponse.error &&
      signInResponse.user &&
      signInResponse.user.name
    ) {
      yield put(accountActions.fetchAccount())
      yield put(signOnActions.signInSucceeded())
      const route = yield select(getRouteOnCompletion)

      // NOTE: Wait on the account success before recording the signin event so that the user account is
      // populated in the store
      yield take(accountActions.fetchAccountSucceeded.type)

      yield put(pushRoute(route || FEED_PAGE))

      const trackEvent = make(Name.SIGN_IN_FINISH, { status: 'success' })
      yield put(trackEvent)

      // Reset the sign on in the background after page load as to relieve the UI loading
      yield delay(1000)
      yield put(signOnActions.resetSignOn())
      setHasRequestedBrowserPermission()
      yield put(accountActions.showPushNotificationConfirmation())
    } else if (
      !signInResponse.error &&
      signInResponse.user &&
      !signInResponse.user.name
    ) {
      // Go to sign up flow because the account is incomplete
      yield put(
        signOnActions.openSignOn(false, Pages.PROFILE, {
          accountAlreadyExisted: true,
          handle: {
            value: signInResponse.user.handle,
            status: 'disabled'
          }
        })
      )
      yield put(signOnActions.showToast(messages.incompleteAccount))
    } else if (signInResponse.error && signInResponse.phase === 'FIND_USER') {
      // Go to sign up flow because the account is incomplete
      yield put(
        signOnActions.openSignOn(false, Pages.PROFILE, {
          accountAlreadyExisted: true
        })
      )
      yield put(signOnActions.showToast(messages.incompleteAccount))
    } else {
      yield put(
        signOnActions.signInFailed(
          signInResponse.error,
          signInResponse.phase,
          false
        )
      )
      const trackEvent = make(Name.SIGN_IN_FINISH, {
        status: 'invalid credentials'
      })
      yield put(trackEvent)
    }
  } catch (err) {
    yield put(signOnActions.signInFailed(err))
  }
}

function* followArtists() {
  yield call(waitForBackendSetup)
  try {
    const signOn = yield select(getSignOn)
    const {
      followArtists: { selectedUserIds }
    } = signOn
    const userIdsToFollow = [
      ...new Set([...defaultFollowUserIds, ...selectedUserIds])
    ]
    for (const userId of userIdsToFollow) {
      yield put(socialActions.followUser(userId))
    }
    const hasFollowConfirmed = userIdsToFollow.map(() => false)
    while (!hasFollowConfirmed.every(Boolean)) {
      const { success, failed } = yield race({
        success: take(socialActions.FOLLOW_USER_SUCCEEDED),
        failed: take(socialActions.FOLLOW_USER_FAILED)
      })
      const { userId } = success || failed
      const userIndex = userIdsToFollow.findIndex(fId => fId === userId)
      if (userIndex > -1) hasFollowConfirmed[userIndex] = true
    }
    // Reload feed is in view
    yield put(signOnActions.setAccountReady())
    // The update user location depends on the user being discoverable in discprov
    // So we wait until both the user is indexed and the follow user actions are finished
    yield call(AudiusBackend.updateUserLocationTimezone)
    yield call(fetchAccountAsync, { fromSource: true })
  } catch (err) {
    console.error({ err })
  }
}

function* configureMetaMask() {
  try {
    window.localStorage.setItem('useMetaMask', JSON.stringify(true))
    yield put(backendActions.setupBackend())
  } catch (err) {
    console.error({ err })
  }
}

function* watchFetchAllFollowArtists() {
  yield takeEvery(signOnActions.FETCH_ALL_FOLLOW_ARTISTS, fetchAllFollowArtist)
}

function* watchFetchReferrer() {
  yield takeLatest(signOnActions.FETCH_REFERRER, fetchReferrer)
}

function* watchValidateEmail() {
  yield takeLatest(signOnActions.VALIDATE_EMAIL, validateEmail)
}

function* watchValidateHandle() {
  yield takeLatest(signOnActions.VALIDATE_HANDLE, validateHandle)
}

function* watchSignUp() {
  yield takeLatest(signOnActions.SIGN_UP, signUp)
}

function* watchSignIn() {
  yield takeLatest(signOnActions.SIGN_IN, signIn)
}

function* watchConfigureMetaMask() {
  yield takeLatest(signOnActions.CONFIGURE_META_MASK, configureMetaMask)
}

function* watchFollowArtists() {
  while (
    yield all([
      take(signOnActions.SIGN_UP_SUCCEEDED),
      take(accountActions.fetchAccountSucceeded.type),
      take(signOnActions.FOLLOW_ARTISTS)
    ])
  ) {
    yield call(followArtists)
  }
}

function* watchShowToast() {
  yield takeLatest(signOnActions.SET_TOAST, function* (action) {
    if (action.text) {
      yield delay(5000)
      yield put(signOnActions.clearToast())
    }
  })
}

function* watchOpenSignOn() {
  yield takeLatest(signOnActions.OPEN_SIGN_ON, function* (action) {
    const route = action.signIn ? SIGN_IN_PAGE : SIGN_UP_PAGE
    yield put(pushRoute(route))
  })
}

function* watchSendWelcomeEmail() {
  yield takeLatest(signOnActions.SEND_WELCOME_EMAIL, function* (action) {
    yield call(AudiusBackend.sendWelcomeEmail, {
      name: action.name
    })
  })
}

export default function sagas() {
  return [
    watchFetchAllFollowArtists,
    watchFetchReferrer,
    watchValidateEmail,
    watchValidateHandle,
    watchSignUp,
    watchSignIn,
    watchFollowArtists,
    watchConfigureMetaMask,
    watchShowToast,
    watchOpenSignOn,
    watchSignOnError,
    watchSendWelcomeEmail
  ]
}
