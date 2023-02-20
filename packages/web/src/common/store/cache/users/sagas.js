import {
  DefaultSizes,
  Kind,
  Status,
  accountSelectors,
  cacheActions,
  cacheUsersSelectors,
  cacheReducer,
  usersActions as userActions,
  waitForValue,
  waitForAccount,
  playlistLibraryHelpers,
  reformatUser,
  usersActions
} from '@audius/common'
import { mergeWith } from 'lodash'
import {
  call,
  put,
  race,
  select,
  take,
  takeEvery,
  getContext
} from 'redux-saga/effects'

import { retrieveCollections } from 'common/store/cache/collections/utils'
import { retrieve } from 'common/store/cache/sagas'
import {
  getSelectedServices,
  getStatus
} from 'common/store/service-selection/selectors'
import { fetchServicesFailed } from 'common/store/service-selection/slice'
import { waitForWrite, waitForRead } from 'utils/sagaHelpers'

import { pruneBlobValues } from './utils'
const { removePlaylistLibraryTempPlaylists } = playlistLibraryHelpers
const { mergeCustomizer } = cacheReducer
const { getUser, getUsers, getUserTimestamps } = cacheUsersSelectors
const { getAccountUser, getUserId } = accountSelectors

/**
 * If the user is not a creator, upgrade the user to a creator node.
 */
export function* upgradeToCreator() {
  yield waitForWrite()
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const user = yield select(getAccountUser)

  // If user already has creator_node_endpoint, do not reselect replica set
  let newEndpoint = user.creator_node_endpoint || ''
  if (!newEndpoint) {
    const serviceSelectionStatus = yield select(getStatus)
    if (serviceSelectionStatus === Status.ERROR) {
      return false
    }
    // Wait for service selection to finish
    const { selectedServices } = yield race({
      selectedServices: call(
        waitForValue,
        getSelectedServices,
        {},
        (val) => val.length > 0
      ),
      failure: take(fetchServicesFailed.type)
    })
    if (!selectedServices) {
      return false
    }
    newEndpoint = selectedServices.join(',')

    // Try to upgrade to creator, early return if failure
    try {
      console.debug(`Attempting to upgrade user ${user.user_id} to creator`)
      yield call(audiusBackendInstance.upgradeToCreator, newEndpoint)
    } catch (err) {
      console.error(`Upgrade to creator failed with error: ${err}`)
      return false
    }
  }
  yield put(
    usersActions.updateUser({
      id: user.user_id,
      changes: {
        creator_node_endpoint: newEndpoint
      }
    })
  )
  return true
}

/**
 * @param {Nullable<Array<number>>} userIds array of user ids to fetch
 * @param {Set<any>} requiredFields
 * @param {boolean} forceRetrieveFromSource
 */
export function* fetchUsers(
  userIds,
  requiredFields = new Set(),
  forceRetrieveFromSource = false
) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  return yield call(retrieve, {
    ids: userIds,
    selectFromCache: function* (ids) {
      return yield select(getUsers, { ids })
    },
    getEntriesTimestamp: function* (ids) {
      return yield select(getUserTimestamps, { ids })
    },
    retrieveFromSource: audiusBackendInstance.getCreators,
    kind: Kind.USERS,
    idField: 'user_id',
    requiredFields,
    forceRetrieveFromSource
  })
}

function* retrieveUserByHandle(handle, retry) {
  yield waitForRead()
  const apiClient = yield getContext('apiClient')
  const userId = yield select(getUserId)
  if (Array.isArray(handle)) {
    handle = handle[0]
  }
  const user = yield apiClient.getUserByHandle({
    handle,
    currentUserId: userId,
    retry
  })
  return user
}

export function* fetchUserByHandle(
  handle,
  requiredFields,
  forceRetrieveFromSource = false,
  shouldSetLoading = true,
  deleteExistingEntry = false,
  retry = true
) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const retrieveFromSource = (handle) => retrieveUserByHandle(handle, retry)
  const { entries: users } = yield call(retrieve, {
    ids: [handle],
    selectFromCache: function* (handles) {
      return yield select(getUsers, { handles })
    },
    getEntriesTimestamp: function* (handles) {
      return yield select(getUserTimestamps, { handles })
    },
    retrieveFromSource,
    onBeforeAddToCache: function (users) {
      return users.map((user) => reformatUser(user, audiusBackendInstance))
    },
    kind: Kind.USERS,
    idField: 'user_id',
    requiredFields,
    forceRetrieveFromSource,
    shouldSetLoading,
    deleteExistingEntry
  })
  return users[handle]
}

/**
 * @deprecated legacy method for web
 * @param {number} userId target user id
 */
export function* fetchUserCollections(userId) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  // Get playlists.
  const playlists = yield call(audiusBackendInstance.getPlaylists, userId)
  const playlistIds = playlists.map((p) => p.playlist_id)

  if (!playlistIds.length) {
    yield put(
      usersActions.updateUser({
        id: userId,
        changes: { _collectionIds: [] }
      })
    )
  }
  const { collections } = yield call(retrieveCollections, userId, playlistIds)
  const cachedCollectionIds = Object.values(collections).map(
    (c) => c.playlist_id
  )

  yield put(
    usersActions.updateUser({
      id: userId,
      changes: { _collectionIds: cachedCollectionIds }
    })
  )
}

// For updates and adds, sync the account user to local storage.
// We use the same mergeCustomizer we use in cacheSagas to merge
// with the local state.
function* watchSyncLocalStorageUser() {
  const localStorage = yield getContext('localStorage')
  function* syncLocalStorageUser(action) {
    yield waitForAccount()
    const currentUser = yield select(getAccountUser)
    if (!currentUser) return
    const currentId = currentUser.user_id
    if (
      action.kind === Kind.USERS &&
      action.entries[0] &&
      action.entries[0].id === currentId
    ) {
      const addedUser = action.entries[0].metadata
      // Get existing locally stored user
      const existing = yield call([localStorage, 'getAudiusAccountUser'])
      // Merge with the new metadata
      const merged = mergeWith({}, existing, addedUser, mergeCustomizer)
      // Remove blob urls if any - blob urls only last for the session so we don't want to store those
      const cleaned = pruneBlobValues(merged)
      // Remove temp playlists from the playlist library since they are only meant to last
      // in the current session until the playlist is finished creating
      // If we don't do this, temp playlists can get stuck in local storage (resulting in a corrupted state)
      // if the user reloads before a temp playlist is resolved.
      cleaned.playlist_library =
        cleaned.playlist_library == null
          ? cleaned.playlist_library
          : removePlaylistLibraryTempPlaylists(cleaned.playlist_library)
      // Set user back to local storage
      yield call([localStorage, 'setAudiusAccountUser'], cleaned)
    }
  }
  yield takeEvery(cacheActions.ADD_SUCCEEDED, syncLocalStorageUser)
  yield takeEvery(cacheActions.UPDATE, syncLocalStorageUser)
}

// Adjusts a user's field in the cache by specifying an update as a delta.
// The cache respects the delta and merges the objects adding the field values
export function* adjustUserField({ user, fieldName, delta }) {
  yield put(
    usersActions.updateUser({
      id: user.user_id,
      changes: {
        [fieldName]: user[fieldName] + delta
      }
    })
  )
}

function* watchFetchProfilePicture() {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const inProgress = new Set()
  yield takeEvery(userActions.fetchProfilePicture.type, function* (action) {
    const { id, size } = action.payload
    // Unique on id and size
    const key = `${id}-${size}`
    if (inProgress.has(key)) return
    inProgress.add(key)

    try {
      const user = yield select(getUser, { id })
      if (!user || (!user.profile_picture_sizes && !user.profile_picture))
        return
      const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
        user.creator_node_endpoint
      )
      if (user.profile_picture_sizes) {
        const url = yield call(
          audiusBackendInstance.getImageUrl,
          user.profile_picture_sizes,
          size,
          gateways
        )

        if (url) {
          yield put(
            usersActions.updateUser({
              id,
              changes: {
                _profile_picture_sizes: {
                  ...user._profile_picture_sizes,
                  [size]: url
                }
              }
            })
          )
        }
      } else if (user.profile_picture) {
        const url = yield call(
          audiusBackendInstance.getImageUrl,
          user.profile_picture,
          null,
          gateways
        )
        if (url) {
          yield put(
            usersActions.updateUser({
              id,
              changes: {
                _profile_picture_sizes: {
                  ...user._profile_picture_sizes,
                  [DefaultSizes.OVERRIDE]: url
                }
              }
            })
          )
        }
      }
    } catch (e) {
      console.error(`Unable to fetch profile picture for user ${id}`)
    } finally {
      inProgress.delete(key)
    }
  })
}

function* watchFetchCoverPhoto() {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const inProgress = new Set()
  yield takeEvery(userActions.fetchCoverPhoto.type, function* (action) {
    const { id, size } = action.payload
    // Unique on id and size
    const key = `${id}-${size}`
    if (inProgress.has(key)) return
    inProgress.add(key)
    try {
      const user = yield select(getUser, { id })
      if (!user || (!user.cover_photo_sizes && !user.cover_photo)) {
        inProgress.delete(key)
        return
      }

      const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
        user.creator_node_endpoint
      )
      if (user.cover_photo_sizes) {
        const url = yield call(
          audiusBackendInstance.getImageUrl,
          user.cover_photo_sizes,
          size,
          gateways
        )

        if (url) {
          yield put(
            usersActions.updateUser({
              id,
              changes: {
                _cover_photo_sizes: {
                  ...user._cover_photo_sizes,
                  [size]: url
                }
              }
            })
          )
        }
      } else if (user.cover_photo) {
        const url = yield call(
          audiusBackendInstance.getImageUrl,
          user.cover_photo,
          null,
          gateways
        )
        if (url) {
          yield put(
            usersActions.updateUser({
              id,
              changes: {
                _cover_photo_sizes: {
                  ...user._cover_photo_sizes,
                  [DefaultSizes.OVERRIDE]: url
                }
              }
            })
          )
        }
      }
    } catch (e) {
      console.error(`Unable to fetch cover photo for user ${id}`)
    } finally {
      inProgress.delete(key)
    }
  })
}

export function* fetchUserSocials({ handle }) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const user = yield call(waitForValue, getUser, { handle })
  const socials = yield call(
    audiusBackendInstance.getCreatorSocialHandle,
    user.handle
  )

  yield put(
    usersActions.updateUser({
      id: user.user_id,
      changes: {
        twitter_handle: socials.twitterHandle || null,
        instagram_handle: socials.instagramHandle || null,
        tiktok_handle: socials.tikTokHandle || null,
        website: socials.website || null,
        donation: socials.donation || null
      }
    })
  )
}

function* watchFetchUserSocials() {
  yield takeEvery(userActions.fetchUserSocials, fetchUserSocials)
}

function* watchFetchUsers() {
  yield takeEvery(userActions.fetchUsers, function* (action) {
    const { userIds, requiredFields, forceRetrieveFromSource } = action.payload
    yield call(fetchUsers, userIds, requiredFields, forceRetrieveFromSource)
  })
}

const sagas = () => {
  return [
    watchFetchProfilePicture,
    watchFetchCoverPhoto,
    watchSyncLocalStorageUser,
    watchFetchUserSocials,
    watchFetchUsers
  ]
}

export default sagas
