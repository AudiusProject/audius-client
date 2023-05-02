import {
  Name,
  DefaultSizes,
  Kind,
  makeKindId,
  makeUid,
  squashNewLines,
  accountSelectors,
  accountActions,
  cacheCollectionsSelectors,
  cacheCollectionsActions as collectionActions,
  PlaylistOperations,
  cacheTracksSelectors,
  cacheUsersSelectors,
  cacheActions,
  getContext,
  audioRewardsPageActions,
  toastActions
} from '@audius/common'
import { isEqual } from 'lodash'
import {
  all,
  call,
  fork,
  put,
  select,
  takeEvery,
  takeLatest
} from 'redux-saga/effects'

import { make } from 'common/store/analytics/actions'
import watchTrackErrors from 'common/store/cache/collections/errorSagas'
import { fetchUsers } from 'common/store/cache/users/sagas'
import * as confirmerActions from 'common/store/confirmer/actions'
import { confirmTransaction } from 'common/store/confirmer/sagas'
import * as signOnActions from 'common/store/pages/signon/actions'
import { addPlaylistsNotInLibrary } from 'common/store/playlist-library/sagas'
import { waitForWrite } from 'utils/sagaHelpers'

import { reformat } from './utils'
import {
  retrieveCollection,
  retrieveCollections
} from './utils/retrieveCollections'

const { manualClearToast, addToast } = toastActions
const { getUser } = cacheUsersSelectors
const { getTrack } = cacheTracksSelectors
const { getCollection } = cacheCollectionsSelectors
const { getAccountUser, getUserId } = accountSelectors
const { setOptimisticChallengeCompleted } = audioRewardsPageActions

/** Counts instances of trackId in a playlist. */
const countTrackIds = (playlistContents, trackId) => {
  return playlistContents.track_ids
    .map((t) => t.track)
    .reduce((acc, t) => {
      if (t === trackId) acc += 1
      return acc
    }, 0)
}

/** CREATE PLAYLIST */

function* watchCreatePlaylist() {
  yield takeLatest(collectionActions.CREATE_PLAYLIST, createPlaylistAsync)
}

function* createPlaylistAsync(action) {
  yield waitForWrite()
  // Potentially grab artwork from the initializing track.
  if (action.initTrackId) {
    const track = yield select(getTrack, { id: action.initTrackId })
    action.formFields._cover_art_sizes = track._cover_art_sizes
    action.formFields.cover_art_sizes = track.cover_art_sizes
  }

  const userId = yield select(getUserId)
  const uid = action.playlistId
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    return
  }
  yield put(collectionActions.createPlaylistRequested())

  const playlist = { playlist_id: uid, ...action.formFields }

  const event = make(Name.PLAYLIST_START_CREATE, {
    source: action.source,
    artworkSource: playlist.artwork ? playlist.artwork.source : ''
  })
  yield put(event)

  yield call(
    confirmCreatePlaylist,
    uid,
    userId,
    action.formFields,
    action.source
  )
  playlist.playlist_id = uid
  playlist.playlist_owner_id = userId
  playlist.is_private = true
  playlist.playlist_contents = { track_ids: [] }
  if (playlist.artwork) {
    playlist._cover_art_sizes = {
      ...playlist._cover_art_sizes,
      [DefaultSizes.OVERRIDE]: playlist.artwork.url
    }
  }
  playlist._temp = false

  const subscribedUid = yield makeUid(Kind.COLLECTIONS, uid, 'account')
  yield put(
    cacheActions.add(
      Kind.COLLECTIONS,
      [
        {
          id: playlist.playlist_id,
          uid: subscribedUid,
          metadata: { ...playlist, is_album: false }
        }
      ],
      /* replace= */ true, // forces cache update
      /* persistent cache */ false // Do not persistent cache since it's missing data
    )
  )
  const user = yield select(getUser, { id: userId })
  yield put(
    accountActions.addAccountPlaylist({
      id: playlist.playlist_id,
      name: playlist.playlist_name,
      isAlbum: playlist.is_album,
      user: { id: userId, handle: user.handle }
    })
  )
  yield put(collectionActions.createPlaylistSucceeded())

  const collectionIds = (user._collectionIds || [])
    .filter((c) => c.uid !== uid)
    .concat(uid)
  yield put(
    cacheActions.update(Kind.USERS, [
      {
        id: userId,
        metadata: { _collectionIds: collectionIds }
      }
    ])
  )
}

function* confirmCreatePlaylist(uid, userId, formFields, source) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')

  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, uid),
      function* () {
        const { blockHash, blockNumber, playlistId, error } = yield call(
          audiusBackendInstance.createPlaylist,
          uid,
          formFields
        )

        if (error || !playlistId) throw new Error('Unable to create playlist')

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm playlist creation for playlist id ${playlistId}`
          )
        }

        const confirmedPlaylist = (yield call(
          audiusBackendInstance.getPlaylists,
          userId,
          [playlistId]
        ))[0]

        // Immediately after confirming the playlist,
        // create a new playlist reference and mark the temporary one as moved.
        // This will trigger the page to refresh, etc. with the new ID url.
        // Even if there are other actions confirming for this particular
        // playlist, those will just file in afterwards.

        const subscribedUid = makeUid(
          Kind.COLLECTIONS,
          confirmedPlaylist.playlist_id,
          'account'
        )
        const movedCollection = yield select(getCollection, { id: uid })

        // The reformatted playlist is the combination of the results we get back
        // from the confirmation, plus any writes that may be in the confirmer still.
        const reformattedPlaylist = {
          ...reformat(confirmedPlaylist, audiusBackendInstance),
          ...movedCollection,
          playlist_id: confirmedPlaylist.playlist_id,
          _temp: false
        }

        // On playlist creation, copy over all fields from the temp collection
        // to retain optimistically set fields.
        yield put(
          cacheActions.add(Kind.COLLECTIONS, [
            {
              id: confirmedPlaylist.playlist_id,
              uid: subscribedUid,
              metadata: reformattedPlaylist
            }
          ])
        )
        const user = yield select(getUser, { id: userId })
        yield put(
          cacheActions.update(Kind.USERS, [
            {
              id: userId,
              metadata: {
                _collectionIds: (user._collectionIds || [])
                  .filter((cId) => cId !== uid && confirmedPlaylist.playlist_id)
                  .concat(confirmedPlaylist.playlist_id)
              }
            }
          ])
        )
        yield put(accountActions.removeAccountPlaylist({ collectionId: uid }))
        yield put(
          accountActions.addAccountPlaylist({
            id: confirmedPlaylist.playlist_id,
            // Take playlist name from the "local" state because the user
            // may have edited the name before we got the confirmed result back.
            name: reformattedPlaylist.playlist_name,
            isAlbum: confirmedPlaylist.is_album,
            user: {
              id: user.user_id,
              handle: user.handle
            }
          })
        )

        // Write out the new playlist to the playlist library
        yield call(addPlaylistsNotInLibrary)

        const event = make(Name.PLAYLIST_COMPLETE_CREATE, {
          source,
          status: 'success'
        })
        yield put(event)
        return confirmedPlaylist
      },
      function* () {},
      function* ({ error, timeout, message }) {
        const event = make(Name.PLAYLIST_COMPLETE_CREATE, {
          source,
          status: 'failure'
        })
        yield put(event)
        yield put(
          collectionActions.createPlaylistFailed(
            message,
            { userId, formFields, source },
            { error, timeout }
          )
        )
      }
    )
  )
}

/** EDIT PLAYLIST */

function* watchEditPlaylist() {
  yield takeLatest(collectionActions.EDIT_PLAYLIST, editPlaylistAsync)
}

function* editPlaylistAsync(action) {
  yield waitForWrite()
  action.formFields.description = squashNewLines(action.formFields.description)

  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    return
  }

  // Updated the stored account playlist shortcut
  yield put(
    accountActions.renameAccountPlaylist({
      collectionId: action.playlistId,
      name: action.formFields.playlist_name
    })
  )

  const playlist = { ...action.formFields }

  yield call(confirmEditPlaylist, action.playlistId, userId, playlist)

  playlist.playlist_id = action.playlistId
  if (playlist.artwork) {
    playlist._cover_art_sizes = {
      ...playlist._cover_art_sizes
    }
    if (playlist.artwork.url) {
      playlist._cover_art_sizes[DefaultSizes.OVERRIDE] = playlist.artwork.url
    }
  }
  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: playlist.playlist_id,
        metadata: playlist
      }
    ])
  )
  yield put(collectionActions.editPlaylistSucceeded())
}

function* confirmEditPlaylist(playlistId, userId, formFields) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),
      function* (confirmedPlaylistId) {
        const { blockHash, blockNumber, error } = yield call(
          audiusBackendInstance.updatePlaylist,
          {
            ...formFields
          }
        )

        if (error) throw error

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm playlist edition for playlist id ${playlistId}`
          )
        }

        return (yield call(audiusBackendInstance.getPlaylists, userId, [
          playlistId
        ]))[0]
      },
      function* (confirmedPlaylist) {
        // Update the cached collection so it no longer contains image upload artifacts
        yield put(
          cacheActions.update(Kind.COLLECTIONS, [
            {
              id: confirmedPlaylist.playlist_id,
              metadata: {
                ...reformat(confirmedPlaylist, audiusBackendInstance),
                artwork: {}
              }
            }
          ])
        )
      },
      function* ({ error, timeout, message }) {
        yield put(
          collectionActions.editPlaylistFailed(
            message,
            { playlistId, userId, formFields },
            { error, timeout }
          )
        )
      },
      (result) => (result.playlist_id ? result.playlist_id : playlistId)
    )
  )
}

/** ADD TRACK TO PLAYLIST */

function* watchAddTrackToPlaylist() {
  yield takeEvery(
    collectionActions.ADD_TRACK_TO_PLAYLIST,
    addTrackToPlaylistAsync
  )
}

function* addTrackToPlaylistAsync(action) {
  yield waitForWrite()
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    return
  }
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const web3 = yield call(audiusBackendInstance.getWeb3)

  // Retrieve tracks with the the collection so we confirm with the
  // most up-to-date information.
  const { collections } = yield call(
    retrieveCollections,
    userId,
    [action.playlistId],
    true
  )
  const playlist = collections[action.playlistId]

  const trackUid = makeUid(
    Kind.TRACKS,
    action.trackId,
    `collection:${action.playlistId}`
  )
  const currentBlockNumber = yield web3.eth.getBlockNumber()
  const currentBlock = yield web3.eth.getBlock(currentBlockNumber)

  playlist.playlist_contents = {
    track_ids: playlist.playlist_contents.track_ids.concat({
      track: action.trackId,
      metadata_time: currentBlock.timestamp,
      uid: trackUid
    })
  }
  const count = countTrackIds(playlist.playlist_contents, action.trackId)

  const event = make(Name.PLAYLIST_ADD, {
    trackId: action.trackId,
    playlistId: action.playlistId
  })
  yield put(event)

  yield call(
    confirmAddTrackToPlaylist,
    userId,
    action.playlistId,
    action.trackId,
    count,
    playlist
  )
  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: playlist.playlist_id,
        metadata: {
          playlist_contents: playlist.playlist_contents
        }
      }
    ])
  )
  yield put(
    cacheActions.subscribe(Kind.TRACKS, [{ uid: trackUid, id: action.trackId }])
  )
  yield put(
    setOptimisticChallengeCompleted({
      challengeId: 'first-playlist',
      specifier: userId
    })
  )
}

function* confirmAddTrackToPlaylist(
  userId,
  playlistId,
  trackId,
  count,
  playlist
) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')

  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),
      function* (confirmedPlaylistId) {
        const { blockHash, blockNumber, error } = yield call(
          audiusBackendInstance.addPlaylistTrack,
          playlist
        )
        if (error) throw error

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm add playlist track for playlist id ${playlistId} and track id ${trackId}`
          )
        }
        return playlistId
      },
      function* (confirmedPlaylistId) {
        const [confirmedPlaylist] = yield call(retrieveCollection, {
          playlistId: confirmedPlaylistId
        })

        const playlist = yield select(getCollection, { id: playlistId })

        /** Since "add track" calls are parallelized, tracks may be added
         * out of order. Here we check if tracks made it in the intended order;
         * if not, we reorder them into the correct order.
         */
        const numberOfTracksMatch =
          confirmedPlaylist.playlist_contents.track_ids.length ===
          playlist.playlist_contents.track_ids.length

        const confirmedPlaylistHasTracks =
          confirmedPlaylist.playlist_contents.track_ids.length > 0

        if (numberOfTracksMatch && confirmedPlaylistHasTracks) {
          const confirmedPlaylistTracks =
            confirmedPlaylist.playlist_contents.track_ids.map((t) => t.track)
          const cachedPlaylistTracks = playlist.playlist_contents.track_ids.map(
            (t) => t.track
          )
          if (!isEqual(confirmedPlaylistTracks, cachedPlaylistTracks)) {
            yield call(
              confirmOrderPlaylist,
              userId,
              playlistId,
              cachedPlaylistTracks
            )
          } else {
            yield put(
              cacheActions.update(Kind.COLLECTIONS, [
                {
                  id: confirmedPlaylist.playlist_id,
                  metadata: confirmedPlaylist
                }
              ])
            )
          }
        }
      },
      function* ({ error, timeout, message }) {
        // Fail Call
        yield put(
          collectionActions.addTrackToPlaylistFailed(
            message,
            { userId, playlistId, trackId, count },
            { error, timeout }
          )
        )
      },
      (result) => (result.playlist_id ? result.playlist_id : playlistId),
      undefined,
      {
        operationId: PlaylistOperations.ADD_TRACK,
        parallelizable: false,
        useOnlyLastSuccessCall: false,
        squashable: true
      }
    )
  )
}

/** REMOVE TRACK FROM PLAYLIST */

function* watchRemoveTrackFromPlaylist() {
  yield takeEvery(
    collectionActions.REMOVE_TRACK_FROM_PLAYLIST,
    removeTrackFromPlaylistAsync
  )
}

function* removeTrackFromPlaylistAsync(action) {
  yield waitForWrite()
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    return
  }

  const playlist = yield select(getCollection, { id: action.playlistId })

  // Find the index of the track based on the track's id and timestamp
  const index = playlist.playlist_contents.track_ids.findIndex((t) => {
    if (t.track !== action.trackId) return false

    return t.metadata_time === action.timestamp || t.time === action.timestamp
  })
  if (index === -1) {
    console.error('Could not find the index of to-be-deleted track')
    return
  }

  const track = playlist.playlist_contents.track_ids[index]
  playlist.playlist_contents.track_ids.splice(index, 1)
  const count = countTrackIds(playlist.playlist_contents, action.trackId)

  yield call(
    confirmRemoveTrackFromPlaylist,
    userId,
    action.playlistId,
    action.trackId,
    track.time,
    count,
    playlist
  )
  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: playlist.playlist_id,
        metadata: {
          playlist_contents: playlist.playlist_contents
        }
      }
    ])
  )
}

// Removes the invalid track ids from the playlist by calling `dangerouslySetPlaylistOrder`
function* fixInvalidTracksInPlaylist(playlistId, invalidTrackIds) {
  yield waitForWrite()
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const apiClient = yield getContext('apiClient')
  const removedTrackIds = new Set(invalidTrackIds)

  const playlist = yield select(getCollection, { id: playlistId })

  const trackIds = playlist.playlist_contents.track_ids
    .map(({ track }) => track)
    .filter((id) => !removedTrackIds.has(id))
  const { error } = yield call(
    audiusBackendInstance.dangerouslySetPlaylistOrder,
    playlistId,
    trackIds
  )
  if (error) throw error

  const currentUserId = yield select(getUserId)
  const playlists = yield apiClient.getPlaylist({
    playlistId,
    currentUserId
  })
  return playlists[0]
}

function* confirmRemoveTrackFromPlaylist(
  userId,
  playlistId,
  trackId,
  timestamp,
  count,
  playlist
) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')

  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),
      function* (confirmedPlaylistId) {
        // NOTE: In an attempt to fix playlists in a corrupted state, only attempt the delete playlist track once,
        // if it fails, check if the playlist is in a corrupted state and if so fix it before re-attempting to delete track from playlist
        let { blockHash, blockNumber, error } = yield call(
          audiusBackendInstance.deletePlaylistTrack,
          playlist
        )
        if (error) {
          const {
            error: tracksInPlaylistError,
            isValid,
            invalidTrackIds
          } = yield call(
            audiusBackendInstance.validateTracksInPlaylist,
            confirmedPlaylistId
          )
          if (tracksInPlaylistError) throw tracksInPlaylistError
          if (!isValid) {
            const updatedPlaylist = yield call(
              fixInvalidTracksInPlaylist,
              confirmedPlaylistId,
              invalidTrackIds
            )
            const isTrackRemoved =
              countTrackIds(updatedPlaylist.playlist_contents, trackId) <= count
            if (isTrackRemoved) return updatedPlaylist
          }
          const response = yield call(
            audiusBackendInstance.deletePlaylistTrack,
            confirmedPlaylistId,
            trackId,
            timestamp
          )
          if (response.error) throw response.error

          blockHash = response.blockHash
          blockNumber = response.blockNumber
        }

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm remove playlist track for playlist id ${playlistId} and track id ${trackId}`
          )
        }
        return confirmedPlaylistId
      },
      function* (confirmedPlaylistId) {
        const [confirmedPlaylist] = yield call(retrieveCollection, {
          playlistId: confirmedPlaylistId
        })
        yield put(
          cacheActions.update(Kind.COLLECTIONS, [
            {
              id: confirmedPlaylist.playlist_id,
              metadata: confirmedPlaylist
            }
          ])
        )
      },
      function* ({ error, timeout, message }) {
        // Fail Call
        yield put(
          collectionActions.removeTrackFromPlaylistFailed(
            message,
            { userId, playlistId, trackId, timestamp, count },
            { error, timeout }
          )
        )
      },
      (result) => (result.playlist_id ? result.playlist_id : playlistId),
      undefined,
      {
        operationId: PlaylistOperations.REMOVE_TRACK,
        parallelizable: false,
        useOnlyLastSuccessCall: false,
        squashable: true
      }
    )
  )
}

/** ORDER PLAYLIST */

function* watchOrderPlaylist() {
  yield takeEvery(collectionActions.ORDER_PLAYLIST, orderPlaylistAsync)
}

function* orderPlaylistAsync(action) {
  yield waitForWrite()
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    return
  }

  const playlist = yield select(getCollection, { id: action.playlistId })

  const trackIds = []
  const updatedPlaylist = {
    ...playlist,
    playlist_contents: {
      ...playlist.playlist_contents,
      track_ids: action.trackIdsAndTimes.map(({ id, time }) => {
        trackIds.push(id)
        return { track: id, time }
      })
    }
  }

  yield call(
    confirmOrderPlaylist,
    userId,
    action.playlistId,
    trackIds,
    updatedPlaylist
  )
  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: updatedPlaylist.playlist_id,
        metadata: updatedPlaylist
      }
    ])
  )
}

function* confirmOrderPlaylist(userId, playlistId, trackIds, playlist) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),
      function* (confirmedPlaylistId) {
        // NOTE: In an attempt to fix playlists in a corrupted state, only attempt the order playlist tracks once,
        // if it fails, check if the playlist is in a corrupted state and if so fix it before re-attempting to order playlist
        let { blockHash, blockNumber, error } = yield call(
          audiusBackendInstance.orderPlaylist,
          playlist
        )
        if (error) {
          const { error, isValid, invalidTrackIds } = yield call(
            audiusBackendInstance.validateTracksInPlaylist,
            confirmedPlaylistId
          )
          if (error) throw error
          if (!isValid) {
            yield call(
              fixInvalidTracksInPlaylist,
              confirmedPlaylistId,
              invalidTrackIds
            )
            const invalidIds = new Set(invalidTrackIds)
            trackIds = trackIds.filter((id) => !invalidIds.has(id))
          }
          // TODO fix validation which relies on legacy contract
          const response = yield call(
            audiusBackendInstance.orderPlaylist,
            trackIds
          )
          if (response.error) {
            throw response.error
          }

          blockHash = response.blockHash
          blockNumber = response.blockNumber
        }

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm order playlist for playlist id ${playlistId}`
          )
        }

        return playlistId
      },
      function* (confirmedPlaylistId) {
        const [confirmedPlaylist] = yield call(retrieveCollection, {
          playlistId: confirmedPlaylistId
        })

        yield put(
          cacheActions.update(Kind.COLLECTIONS, [
            {
              id: confirmedPlaylist.playlist_id,
              metadata: confirmedPlaylist
            }
          ])
        )
      },
      function* ({ error, timeout, message }) {
        // Fail Call
        yield put(
          collectionActions.orderPlaylistFailed(
            message,
            { userId, playlistId, trackIds },
            { error, timeout }
          )
        )
      },
      (result) => (result.playlist_id ? result.playlist_id : playlistId),
      undefined,
      { operationId: PlaylistOperations.REORDER, squashable: true }
    )
  )
}

/** PUBLISH PLAYLIST */

function* watchPublishPlaylist() {
  yield takeEvery(collectionActions.PUBLISH_PLAYLIST, publishPlaylistAsync)
}

function* publishPlaylistAsync(action) {
  yield waitForWrite()
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    return
  }

  const event = make(Name.PLAYLIST_MAKE_PUBLIC, { id: action.playlistId })
  yield put(event)

  const playlist = yield select(getCollection, { id: action.playlistId })
  playlist._is_publishing = true
  yield put(
    cacheActions.update(Kind.COLLECTIONS, [
      {
        id: playlist.playlist_id,
        metadata: { _is_publishing: true }
      }
    ])
  )

  yield call(
    confirmPublishPlaylist,
    userId,
    action.playlistId,
    playlist,
    action.dismissToastKey
  )
}

function* confirmPublishPlaylist(
  userId,
  playlistId,
  playlist,
  dismissToastKey
) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),
      function* (confirmedPlaylistId) {
        const { blockHash, blockNumber, error } = yield call(
          audiusBackendInstance.publishPlaylist,
          playlist
        )
        if (error) throw error

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm publish playlist for playlist id ${playlistId}`
          )
        }
        return (yield call(audiusBackendInstance.getPlaylists, userId, [
          playlistId
        ]))[0]
      },
      function* (confirmedPlaylist) {
        confirmedPlaylist.is_private = false
        confirmedPlaylist._is_publishing = false
        yield put(
          cacheActions.update(Kind.COLLECTIONS, [
            {
              id: confirmedPlaylist.playlist_id,
              metadata: confirmedPlaylist
            }
          ])
        )
        if (dismissToastKey) {
          yield* put(manualClearToast({ key: dismissToastKey }))
          yield* put(addToast({ content: 'Your playlist is now public!' }))
        }
      },
      function* ({ error, timeout, message }) {
        // Fail Call
        yield put(
          collectionActions.publishPlaylistFailed(
            message,
            { userId, playlistId },
            { error, timeout }
          )
        )
      },
      (result) => (result.playlist_id ? result.playlist_id : playlistId)
    )
  )
}

/** DELETE PLAYLIST */

function* watchDeletePlaylist() {
  yield takeEvery(collectionActions.DELETE_PLAYLIST, deletePlaylistAsync)
}

function* deletePlaylistAsync(action) {
  yield waitForWrite()
  const userId = yield select(getUserId)
  if (!userId) {
    yield put(signOnActions.openSignOn(false))
    return
  }

  // Depending on whether the collection is an album
  // or playlist, we should either delete all the tracks
  // or just delete the collection.
  const collection = yield select(getCollection, { id: action.playlistId })
  if (!collection) return

  const isAlbum = collection.is_album
  if (isAlbum) {
    const trackIds = collection.playlist_contents.track_ids

    const event = make(Name.DELETE, { kind: 'album', id: action.playlistId })
    yield put(event)
    yield call(confirmDeleteAlbum, action.playlistId, trackIds, userId)
  } else {
    const event = make(Name.DELETE, { kind: 'playlist', id: action.playlistId })
    yield put(event)

    // Preemptively mark the playlist as deleted.
    // It's possible there are other transactions confirming
    // for this playlist, which prevent the delete confirmation
    // from running immediately, which would leave
    // the playlist visible before it runs.
    yield put(
      cacheActions.update(Kind.COLLECTIONS, [
        {
          id: action.playlistId,
          metadata: { _marked_deleted: true }
        }
      ])
    )
    yield call(confirmDeletePlaylist, userId, action.playlistId)
  }

  const user = yield select(getUser, { id: userId })
  yield put(
    cacheActions.update(Kind.USERS, [
      {
        id: userId,
        metadata: {
          _collectionIds: (user._collectionIds || []).filter(
            (cId) => cId !== action.playlistId
          )
        }
      }
    ])
  )
}

function* confirmDeleteAlbum(playlistId, trackIds, userId) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),

      // we don't have to worry about passing in a confirmed ID
      // here because unlike deleting a playlist, when
      // deleting an album we know it's persisted to chain already
      // thus we have it's permanent ID.
      function* () {
        // Optimistically mark everything as deleted
        yield all([
          put(
            cacheActions.update(Kind.COLLECTIONS, [
              {
                id: playlistId,
                metadata: { _marked_deleted: true }
              }
            ])
          ),
          put(
            cacheActions.update(
              Kind.TRACKS,
              trackIds.map((t) => ({
                id: t.track,
                metadata: { _marked_deleted: true }
              }))
            )
          ),
          put(
            accountActions.removeAccountPlaylist({ collectionId: playlistId })
          )
        ])

        const { blockHash, blockNumber, error } = yield call(
          audiusBackendInstance.deleteAlbum,
          playlistId,
          trackIds
        )
        if (error) throw error

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(`Could not confirm delete album for id ${playlistId}`)
        }
        return playlistId
      },
      function* () {
        console.debug(`Successfully deleted album ${playlistId}`)
        yield put(cacheActions.remove(Kind.COLLECTIONS, [playlistId]))
      },
      function* ({ error, timeout, message }) {
        console.error(`Failed to delete album ${playlistId}`)
        // Need to revert the deletes now
        const [playlist, user] = yield all([
          select(getCollection, { id: playlistId }),
          select(getAccountUser)
        ])
        yield all([
          put(
            cacheActions.update(Kind.COLLECTIONS, [
              {
                id: playlistId,
                metadata: { _marked_deleted: false }
              }
            ])
          ),
          put(
            cacheActions.update(
              Kind.TRACKS,
              trackIds.map((t) => ({
                id: t.track,
                metadata: { _marked_deleted: false }
              }))
            )
          ),
          put(
            accountActions.addAccountPlaylist({
              id: playlist.playlist_id,
              name: playlist.playlist_name,
              isAlbum: playlist.is_album,
              user: { id: user.user_id, handle: user.handle }
            })
          )
        ])
        yield put(
          collectionActions.deletePlaylistFailed(
            message,
            { playlistId, trackIds, userId },
            { error, timeout }
          )
        )
      }
    )
  )
}

function* confirmDeletePlaylist(userId, playlistId) {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  yield put(
    confirmerActions.requestConfirmation(
      makeKindId(Kind.COLLECTIONS, playlistId),
      function* (confirmedPlaylistId) {
        // Optimistically mark playlist as removed
        yield all([
          put(
            cacheActions.update(Kind.COLLECTIONS, [
              {
                id: playlistId,
                metadata: { _marked_deleted: true }
              }
            ])
          ),
          put(
            accountActions.removeAccountPlaylist({ collectionId: playlistId })
          )
        ])

        const { blockHash, blockNumber, error } = yield call(
          audiusBackendInstance.deletePlaylist,
          playlistId
        )
        if (error) throw error

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm delete playlist track for playlist id ${playlistId}`
          )
        }
        return playlistId
      },
      function* () {
        console.debug(`Successfully deleted playlist ${playlistId}`)
        yield put(cacheActions.remove(Kind.COLLECTIONS, [playlistId]))
      },
      function* ({ error, timeout, message }) {
        console.error(`Failed to delete playlist ${playlistId}`)
        const [playlist, user] = yield all([
          select(getCollection, { id: playlistId }),
          select(getAccountUser)
        ])
        yield all([
          put(
            cacheActions.update(Kind.COLLECTIONS, [
              {
                id: playlistId,
                metadata: { _marked_deleted: false }
              }
            ])
          ),
          put(
            accountActions.addAccountPlaylist({
              id: playlist.playlist_id,
              name: playlist.playlist_name,
              isAlbum: playlist.is_album,
              user: { id: user.user_id, handle: user.handle }
            })
          )
        ])
        yield put(
          collectionActions.deletePlaylistFailed(
            message,
            { playlistId, userId },
            { error, timeout }
          )
        )
      },
      (result) => (result.playlist_id ? result.playlist_id : playlistId)
    )
  )
}

function* fetchRepostInfo(entries) {
  const userIds = []
  entries.forEach((entry) => {
    if (entry.metadata.followee_reposts) {
      entry.metadata.followee_reposts.forEach((repost) =>
        userIds.push(repost.user_id)
      )
    }
  })
  if (userIds.length > 0) {
    const { entries: users, uids } = yield call(fetchUsers, userIds)

    const updates = []
    const subscriptions = []
    entries.forEach((entry) => {
      const followeeRepostUsers = { id: entry.id, metadata: { _followees: [] } }
      const subscriptionUids = []
      entry.metadata.followee_reposts.forEach((repost) => {
        followeeRepostUsers.metadata._followees.push({
          ...repost,
          ...users[repost.user_id]
        })
        subscriptionUids.push(uids[repost.user_id])
      })
      updates.push(followeeRepostUsers)
      if (subscriptionUids.length > 0) {
        subscriptions.push({
          id: entry.id,
          kind: Kind.USERS,
          uids: subscriptionUids
        })
      }
    })

    yield put(cacheActions.update(Kind.COLLECTIONS, updates, subscriptions))
  }
}

function* watchAdd() {
  yield takeEvery(cacheActions.ADD_SUCCEEDED, function* (action) {
    if (action.kind === Kind.COLLECTIONS) {
      yield fork(fetchRepostInfo, action.entries)
    }
  })
}

function* watchFetchCoverArt() {
  const audiusBackendInstance = yield getContext('audiusBackendInstance')
  const inProgress = new Set()
  yield takeEvery(
    collectionActions.FETCH_COVER_ART,
    function* ({ collectionId, size }) {
      // Unique on id and size
      const key = `${collectionId}-${size}`
      if (inProgress.has(key)) return
      inProgress.add(key)

      try {
        const collection = yield select(getCollection, { id: collectionId })
        const user = yield select(getUser, { id: collection.playlist_owner_id })
        if (
          !collection ||
          !user ||
          (!collection.cover_art_sizes && !collection.cover_art)
        )
          return

        const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
          user.creator_node_endpoint
        )
        const multihash = collection.cover_art_sizes || collection.cover_art
        const coverArtSize =
          multihash === collection.cover_art_sizes ? size : null
        const url = yield call(
          audiusBackendInstance.getImageUrl,
          multihash,
          coverArtSize,
          gateways
        )
        yield put(
          cacheActions.update(Kind.COLLECTIONS, [
            {
              id: collectionId,
              metadata: {
                ...collection,
                _cover_art_sizes: {
                  ...collection._cover_art_sizes,
                  [coverArtSize || DefaultSizes.OVERRIDE]: url
                }
              }
            }
          ])
        )
      } catch (e) {
        console.error(
          `Unable to fetch cover art for collection ${collectionId}`,
          e
        )
      } finally {
        inProgress.delete(key)
      }
    }
  )
}

export default function sagas() {
  return [
    watchAdd,
    watchCreatePlaylist,
    watchEditPlaylist,
    watchAddTrackToPlaylist,
    watchRemoveTrackFromPlaylist,
    watchOrderPlaylist,
    watchPublishPlaylist,
    watchDeletePlaylist,
    watchFetchCoverArt,
    watchTrackErrors
  ]
}
