import { Kind, Name, Status, makeUid } from '@audius/common'
import { push as pushRoute } from 'connected-react-router'
import { range } from 'lodash'
import { channel, buffers } from 'redux-saga'
import {
  call,
  put,
  select,
  take,
  takeLatest,
  fork,
  cancel,
  all,
  race
} from 'redux-saga/effects'

import * as accountActions from 'common/store/account/reducer'
import {
  getAccountUser,
  getUserHandle,
  getUserId
} from 'common/store/account/selectors'
import * as cacheActions from 'common/store/cache/actions'
import { reformat } from 'common/store/cache/collections/utils'
import * as tracksActions from 'common/store/cache/tracks/actions'
import { trackNewRemixEvent } from 'common/store/cache/tracks/sagas'
import { getUser } from 'common/store/cache/users/selectors'
import { formatUrlName } from 'common/utils/formatUtil'
import {
  getSelectedServices,
  getStatus
} from 'components/service-selection/store/selectors'
import { fetchServicesFailed } from 'components/service-selection/store/slice'
import UploadType from 'pages/upload-page/components/uploadType'
import { getStems } from 'pages/upload-page/store/selectors'
import { updateAndFlattenStems } from 'pages/upload-page/store/utils/stems'
import AudiusBackend from 'services/AudiusBackend'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { make } from 'store/analytics/actions'
import { waitForBackendSetup } from 'store/backend/sagas'
import * as confirmerActions from 'store/confirmer/actions'
import { confirmTransaction } from 'store/confirmer/sagas'
import { ERROR_PAGE } from 'utils/route'
import { actionChannelDispatcher, waitForValue } from 'utils/sagaHelpers'

import * as uploadActions from './actions'
import { watchUploadErrors } from './errorSagas'
import { ProgressStatus } from './types'
import { reportSuccessAndFailureEvents } from './utils/sagaHelpers'

const MAX_CONCURRENT_UPLOADS = 4
const MAX_CONCURRENT_REGISTRATIONS = 4
const MAX_CONCURRENT_TRACK_SIZE_BYTES = 40 /* MB */ * 1024 * 1024
const UPLOAD_TIMEOUT_MILLIS =
  2 /* hour */ * 60 /* min */ * 60 /* sec */ * 1000 /* ms */

/**
 * Combines the metadata for a track and a collection (playlist or album),
 * taking the metadata from the playlist when the track is missing it.
 * @param {object} trackMetadata
 * @param {object} collectionMetadata
 */
const combineMetadata = (trackMetadata, collectionMetadata) => {
  const metadata = trackMetadata

  metadata.cover_art_sizes = collectionMetadata.cover_art_sizes
  metadata.artwork = collectionMetadata.artwork

  if (!metadata.genre) metadata.genre = collectionMetadata.genre
  if (!metadata.mood) metadata.mood = collectionMetadata.mood

  if (collectionMetadata.tags) {
    if (!metadata.tags) {
      // Take collection tags
      metadata.tags = collectionMetadata.tags
    } else {
      // Combine tags and dedupe
      metadata.tags = [
        ...new Set([
          ...metadata.tags.split(','),
          ...collectionMetadata.tags.split(',')
        ])
      ].join(',')
    }
  }
  return trackMetadata
}

const getNumWorkers = (trackFiles) => {
  const largestFileSize = Math.max(...trackFiles.map((t) => t.size))

  // Divide it out so that we never hit > MAX_CONCURRENT_TRACK_SIZE_BYTES in flight.
  // e.g. so if we have 40 MB max upload and max track size of 15MB,
  // floor(40/15) => 2 workers
  const numWorkers = Math.floor(
    MAX_CONCURRENT_TRACK_SIZE_BYTES / largestFileSize
  )
  const maxWorkers = Math.min(MAX_CONCURRENT_UPLOADS, trackFiles.length)

  // Clamp between 1 and `maxWorkers`
  return Math.min(Math.max(numWorkers, 1), maxWorkers)
}

// Worker to handle individual track upload requests.
// Crucially, the worker will block on receiving more requests
// until its current request has finished processing.
//
// Workers can either be send a request that looks like:
// {
//   track: ...,
//   metadata: ...,
//   id: ...,
//   index: ...
//   artwork?: ...,
//   isCollection: boolean
//   updateProgress: boolean
// }
//
// or to signal to the worker that it should shut down:
// { done: true }
//
// Workers respond differently depending on whether the request was
// a collection or not.
// For a collection:
// {
//    originalId: ...
//    metadataMultihash: ...
//    metadataFileUUID: ...
// }
//
// For individual tracks:
//  {
//    originalId: ...,
//    newId: ...
//  }
//
// And if the worker encountered an error:
//  {
//    originalId: ...
//    error: true
//  }
//
function* uploadWorker(requestChan, respChan, progressChan) {
  // Use this channel to know when confirmer has finished,
  // so we can unblock this worker to accept more requests.
  const uploadDoneChan = yield call(channel)

  const makeOnProgress = (index) => {
    // Tracks can retry now, so that means
    // the loaded value may actually retreat. We don't want to show
    // this to the user, so only feed increasing vals of loaded into
    // progressChan
    let maxLoaded = 0

    return (loaded, total) => {
      maxLoaded = Math.max(maxLoaded, loaded)
      try {
        progressChan.put(
          uploadActions.updateProgress(index, {
            loaded: maxLoaded,
            total,
            status:
              loaded !== total
                ? ProgressStatus.UPLOADING
                : ProgressStatus.PROCESSING
          })
        )
      } catch {
        // Sometimes this can fail repeatedly in quick succession (root cause TBD)
        // it doesn't seem to affect the CX so catch to avoid spamming sentry
      }
    }
  }

  // If it's not a collection (e.g. we're just uploading multiple tracks)
  // we can call uploadTrack, which uploads to creator node and then writes to chain.
  const makeConfirmerCall = (
    track,
    metadata,
    artwork,
    index,
    id,
    updateProgress
  ) => {
    return function* () {
      console.debug(
        `Beginning non-collection upload for track: ${metadata.title}`
      )
      const { blockHash, blockNumber, trackId, error, phase } = yield call(
        AudiusBackend.uploadTrack,
        track.file,
        artwork,
        metadata,
        updateProgress ? makeOnProgress(index) : (loaded, total) => {}
      )

      // b/c we can't pass extra info (phase) into the confirmer fail call, we need to clean up here.
      // (not great)
      if (error) {
        // If we failed, signal to the parent saga
        yield put(respChan, {
          originalId: id,
          error: true,
          timeout: false,
          message: error,
          phase
        })

        // Just to prevent success call from running
        throw new Error('')
      }

      console.debug(`Got new ID ${trackId} for track ${metadata.title}}`)

      const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
      if (!confirmed) {
        throw new Error(
          `Could not confirm track upload for track id ${trackId}`
        )
      }
      return trackId
    }
  }

  // If it is a collection, we should just upload to creator node.
  const makeConfirmerCallForCollection = (track, metadata, artwork, index) => {
    return function* () {
      console.debug(`Beginning collection upload for track: ${metadata.title}`)
      return yield call(
        AudiusBackend.uploadTrackToCreatorNode,
        track.file,
        artwork,
        metadata,
        makeOnProgress(index)
      )
    }
  }

  const makeConfirmerSuccess = (id, index, updateProgress) => {
    return function* (newTrackId) {
      if (updateProgress) {
        yield put(
          progressChan,
          uploadActions.updateProgress(index, {
            status: ProgressStatus.COMPLETE
          })
        )
      }

      // Now we need to tell the response channel that we finished
      const resp = { originalId: id, newId: newTrackId }
      console.debug(`Finished track upload of id: ${newTrackId}`)
      yield put(respChan, resp)

      // Finally, unblock this worker
      yield put(uploadDoneChan, {})
    }
  }

  const makeConfirmerSuccessForCollection = (id, index) => {
    return function* ({
      metadataMultihash,
      metadataFileUUID,
      transcodedTrackCID,
      transcodedTrackUUID
    }) {
      console.debug({
        metadataMultihash,
        metadataFileUUID,
        transcodedTrackCID,
        transcodedTrackUUID
      })

      // Don't tell the progress channel we're done yet, because we need
      // to still call to chain.
      // Now we need to tell the response channel that we finished
      const resp = {
        originalId: id,
        metadataMultihash,
        metadataFileUUID,
        transcodedTrackCID,
        transcodedTrackUUID
      }

      console.debug(`Finished creator node upload of: ${JSON.stringify(resp)}`)
      yield put(respChan, resp)

      // Finally, unblock this worker
      yield put(uploadDoneChan, {})
    }
  }

  function* confirmerFailure() {
    // unblock this worker
    yield put(uploadDoneChan, {})
  }

  const makeConfirmerFailureCollection = (originalId) => {
    return function* ({ timeout, message }) {
      console.error(`Upload failed for id: ${originalId}`)
      // If we failed, signal to the parent saga
      yield put(respChan, {
        originalId,
        error: true,
        timeout,
        message
      })

      // Now unblock this worker
      yield put(uploadDoneChan, {})
    }
  }

  // worker runloop
  while (true) {
    const request = yield take(requestChan)
    const {
      track,
      metadata,
      id,
      index,
      artwork,
      isCollection,
      updateProgress
    } = request

    yield put(
      confirmerActions.requestConfirmation(
        id,
        (isCollection ? makeConfirmerCallForCollection : makeConfirmerCall)(
          track,
          metadata,
          artwork,
          index,
          id,
          updateProgress
        ),
        (isCollection
          ? makeConfirmerSuccessForCollection
          : makeConfirmerSuccess)(id, index, updateProgress),
        isCollection ? makeConfirmerFailureCollection(id) : confirmerFailure,
        () => {},
        UPLOAD_TIMEOUT_MILLIS
      )
    )

    yield take(uploadDoneChan)
  }
}

/*
 * handleUploads spins up to MAX_CONCURRENT_UPLOADS workers to handle individual uploads.
 *
 * tracks is of type [{ track: ..., metadata: ... }]
 */
export function* handleUploads({
  tracks,
  isCollection,
  isStem = false,
  isAlbum = false
}) {
  const numWorkers = getNumWorkers(tracks.map((t) => t.track.file))

  // Map of shape {[trackId]: { track: track, metadata: object, artwork?: file, index: number }}
  const idToTrackMap = tracks.reduce((prev, cur, idx) => {
    const newId = `${cur.metadata.title}_${idx}`
    prev[newId] = {
      track: cur.track,
      metadata: cur.metadata,
      index: idx,
      artwork: cur.metadata.artwork.file
    }
    return prev
  }, {})

  // `progressChan` is used to dispatch
  // redux actions so the UI knows what's going on.
  const progressChan = yield call(channel)
  const actionDispatcherTask = yield fork(actionChannelDispatcher, progressChan)

  // `requestChan` is used to communicate
  // requests to workers from this main process
  const requestChan = yield call(channel, buffers.expanding(10))

  // `respChan` is used to communicate
  // when a worker has finished it's job
  // It will see result like { originalId: id, newId: trackInfo.newId }
  const respChan = yield call(channel)

  // Spawn up our workers
  console.debug(`Spinning up ${numWorkers} workers`)
  const workerTasks = yield all(
    range(numWorkers).map((_) =>
      fork(uploadWorker, requestChan, respChan, progressChan)
    )
  )

  // Give our workers jobs to do
  const ids = Object.keys(idToTrackMap)
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const value = idToTrackMap[id]
    const request = {
      id,
      track: value.track,
      metadata: value.metadata,
      index: value.index,
      artwork: isCollection ? null : value.artwork,
      isCollection,
      updateProgress: !isStem
    }
    yield put(requestChan, request)
    yield put(
      make(Name.TRACK_UPLOAD_TRACK_UPLOADING, {
        artworkSource: value.metadata.artwork.source,
        genre: value.metadata.genre,
        mood: value.metadata.mood,
        downloadable:
          value.metadata.download && value.metadata.download.is_downloadable
            ? value.metadata.download.requires_follow
              ? 'follow'
              : 'yes'
            : 'no'
      })
    )
  }

  // Set some sensible progress values
  if (!isStem) {
    for (let i = 0; i < ids.length; i++) {
      const trackFile = tracks[i].track.file
      yield put(
        progressChan,
        uploadActions.updateProgress(i, {
          loaded: 0,
          total: trackFile.size,
          status: ProgressStatus.UPLOADING
        })
      )
    }
  }

  // Now wait for our workers to finish or error
  console.debug('Awaiting workers')
  let numOutstandingRequests = tracks.length
  let numSuccessRequests = 0 // Technically not needed, but adding defensively
  const trackIds = []
  const creatorNodeMetadata = []
  const failedRequests = [] // Array of shape [{ id, timeout, message }]

  // We should only stop the whole upload if a request fails
  // in the collection upload case.
  const stopDueToFailure = () => failedRequests.length > 0 && isCollection

  while (!stopDueToFailure() && numOutstandingRequests !== 0) {
    const {
      error,
      phase,
      timeout,
      message,
      originalId,
      newId,
      metadataMultihash,
      metadataFileUUID,
      transcodedTrackCID,
      transcodedTrackUUID
    } = yield take(respChan)

    if (error) {
      console.error('Worker errored')
      const index = idToTrackMap[originalId].index

      if (!isStem) {
        yield put(uploadActions.uploadSingleTrackFailed(index))
      }

      // Save this out to the failedRequests array
      failedRequests.push({ originalId, timeout, message, phase })
      numOutstandingRequests -= 1
      continue
    }

    // Logic here depends on whether it's a collection or not.
    // If it's not a collection, rejoice because we have the trackId already.
    // Otherwise, save our metadata and continue on.
    if (isCollection) {
      creatorNodeMetadata.push({
        metadataMultihash,
        metadataFileUUID,
        transcodedTrackCID,
        transcodedTrackUUID,
        originalId
      })
    } else {
      const trackObj = idToTrackMap[originalId]
      trackIds[trackObj.index] = newId
    }

    // Finally, decrement the request count and increase success count
    numOutstandingRequests -= 1
    numSuccessRequests += 1
  }

  // Regardless of whether we stopped due to finishing
  // all requests or from an error,  now we spin down.
  console.debug('Spinning down workers')
  yield all(workerTasks.map((t) => cancel(t)))

  let returnVal = { trackIds }

  // Report success + failure events
  const uploadType = isCollection
    ? isAlbum
      ? 'album'
      : 'playlist'
    : 'multi_track'
  yield reportSuccessAndFailureEvents({
    // Don't report non-uploaded tracks due to playlist upload abort
    numSuccess: numSuccessRequests,
    numFailure: failedRequests.length,
    errors: failedRequests.map((r) => r.message),
    uploadType
  })

  if (isCollection) {
    // If this was a collection and we didn't error,
    // now we go write all this out to chain
    if (failedRequests.length === 0) {
      // First, re-sort the CNODE metadata
      // to match what was originally sent by the user.
      const sortedMetadata = []
      creatorNodeMetadata.forEach((m) => {
        const originalIndex = idToTrackMap[m.originalId].index
        sortedMetadata[originalIndex] = m
      })

      console.debug(
        `Attempting to register tracks: ${JSON.stringify(sortedMetadata)}`
      )

      // Send the tracks off to chain to get our trackIDs
      //
      // We want to limit the number of concurrent requests to chain here, as tons and tons of
      // tracks lead to a lot of metadata being colocated on the same block and discovery nodes
      // can have a hard time keeping up. [see AUD-462]. So, chunk the registration into "rounds."
      //
      // Multi-track upload does not have the same issue because we write to chain immediately
      // after each upload succeeds and those fire on a rolling window.
      // Realistically, with a higher throughput system, this should be a non-issue.
      let trackIds = []
      let error = null
      for (
        let i = 0;
        i < sortedMetadata.length;
        i += MAX_CONCURRENT_REGISTRATIONS
      ) {
        const concurrentMetadata = sortedMetadata.slice(
          i,
          i + MAX_CONCURRENT_REGISTRATIONS
        )
        const { trackIds: roundTrackIds, error: roundHadError } =
          yield AudiusBackend.registerUploadedTracks(concurrentMetadata)

        trackIds = trackIds.concat(roundTrackIds)
        console.debug(
          `Finished registering: ${roundTrackIds}, Registered so far: ${trackIds}`
        )

        // Any errors should break out, but we need to record the associated tracks first
        // so that we can delete the orphaned ones.
        if (roundHadError) {
          error = roundHadError
          break
        }
      }

      if (error) {
        console.error('Something went wrong registering tracks!')

        // Delete tracks if necessary
        if (trackIds.length > 0) {
          // If there were tracks, that means we wrote to chain
          // but our call to associate failed.
          // First log this error, but don't navigate away
          // bc we need them to keep the page open to delete tracks
          yield put(uploadActions.associateTracksError(error))
          console.debug(`Deleting orphaned tracks: ${JSON.stringify(trackIds)}`)
          try {
            yield all(trackIds.map((id) => AudiusBackend.deleteTrack(id)))
            console.debug('Successfully deleted orphaned tracks')
          } catch {
            console.debug('Something went wrong deleting orphaned tracks')
          }
          // Now navigate them to something went wrong
          yield put(pushRoute(ERROR_PAGE))
        } else {
          yield put(uploadActions.addTrackToChainError(error))
        }

        returnVal = { error: true }
      } else {
        console.debug('Tracks registered successfully')
        // Update all the progress
        if (!isStem) {
          yield all(
            range(tracks.length).map((i) =>
              put(
                progressChan,
                uploadActions.updateProgress(i, {
                  status: ProgressStatus.COMPLETE
                })
              )
            )
          )
        }
        returnVal = { trackIds }
      }
    } else {
      // Because it's a collection we stopped for just 1
      // failed request
      const { timeout, message } = failedRequests[0]
      if (timeout) {
        yield put(uploadActions.creatorNodeTimeoutError())
      } else {
        yield put(uploadActions.creatorNodeUploadError(message))
      }
      returnVal = { error: true }
    }
  } else if (!isCollection && failedRequests.length > 0) {
    // If some requests failed for multitrack, log em
    yield all(
      failedRequests.map((r) => {
        if (r.timeout) {
          return put(uploadActions.multiTrackTimeoutError())
        } else {
          return put(
            uploadActions.multiTrackUploadError(
              r.message,
              r.phase,
              tracks.length,
              isStem
            )
          )
        }
      })
    )
  }

  console.debug('Finished upload')

  yield call(progressChan.close)
  yield cancel(actionDispatcherTask)
  return returnVal
}

function* uploadCollection(tracks, userId, collectionMetadata, isAlbum) {
  // First upload album art
  const coverArtResp = yield call(
    AudiusBackend.uploadImage,
    collectionMetadata.artwork.file
  )
  collectionMetadata.cover_art_sizes = coverArtResp.dirCID

  // Then upload tracks
  const tracksWithMetadata = tracks.map((track) => {
    const metadata = combineMetadata(track.metadata, collectionMetadata)
    return {
      track,
      metadata
    }
  })
  const { trackIds, error } = yield call(handleUploads, {
    tracks: tracksWithMetadata,
    isCollection: true,
    isAlbum
  })

  // If we errored, return early
  if (error) {
    console.debug('Saw an error, not going to create a playlist.')
    return
  }

  // Finally, create the playlist
  yield put(
    confirmerActions.requestConfirmation(
      `${collectionMetadata.playlist_name}_${Date.now()}`,
      function* () {
        console.debug('Creating playlist')
        // Uploaded collections are always public
        const isPrivate = false
        const { blockHash, blockNumber, playlistId, error } = yield call(
          AudiusBackend.createPlaylist,
          userId,
          collectionMetadata,
          isAlbum,
          trackIds,
          isPrivate
        )

        if (error) {
          console.debug('Caught an error creating playlist')
          if (playlistId) {
            yield put(uploadActions.createPlaylistErrorIDExists(error))
            console.debug('Deleting playlist')
            // If we got a playlist ID back, that means we
            // created the playlist but adding tracks to it failed. So we must delete the playlist
            yield call(AudiusBackend.deletePlaylist, playlistId)
            console.debug('Playlist deleted successfully')
          } else {
            // I think this is what we want
            yield put(uploadActions.createPlaylistErrorNoId(error))
          }
          // Throw to trigger the fail callback
          throw new Error('Playlist creation error')
        }

        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(
            `Could not confirm playlist creation for playlist id ${playlistId}`
          )
        }
        return (yield call(AudiusBackend.getPlaylists, userId, [playlistId]))[0]
      },
      function* (confirmedPlaylist) {
        yield put(
          uploadActions.uploadTracksSucceeded(confirmedPlaylist.playlist_id)
        )
        const user = yield select(getUser, { id: userId })
        yield put(
          cacheActions.update(Kind.USERS, [
            {
              id: userId,
              metadata: {
                _collectionIds: (user._collectionIds || []).concat(
                  confirmedPlaylist.playlist_id
                )
              }
            }
          ])
        )

        // Add images to the collection since we're not loading it the traditional way with
        // the `fetchCollections` saga
        confirmedPlaylist = yield call(reformat, confirmedPlaylist)
        const uid = yield makeUid(
          Kind.COLLECTIONS,
          confirmedPlaylist.playlist_id,
          'account'
        )
        // Create a cache entry and add it to the account so the playlist shows in the left nav
        yield put(
          cacheActions.add(
            Kind.COLLECTIONS,
            [
              {
                id: confirmedPlaylist.playlist_id,
                uid,
                metadata: confirmedPlaylist
              }
            ],
            /* replace= */ true // forces cache update
          )
        )
        yield put(
          accountActions.addAccountPlaylist({
            id: confirmedPlaylist.playlist_id,
            name: confirmedPlaylist.playlist_name,
            is_album: confirmedPlaylist.is_album,
            user: {
              id: user.user_id,
              handle: user.handle
            }
          })
        )
        yield put(
          make(Name.TRACK_UPLOAD_COMPLETE_UPLOAD, {
            count: trackIds.length,
            kind: isAlbum ? 'album' : 'playlist'
          })
        )
        yield put(cacheActions.setExpired(Kind.USERS, userId))
      },
      function* ({ timeout }) {
        // All other non-timeout errors have
        // been accounted for at this point
        if (timeout) {
          yield put(uploadActions.createPlaylistPollingTimeout())
        }

        console.error(
          `Create playlist call failed, deleting tracks: ${JSON.stringify(
            trackIds
          )}`
        )
        try {
          yield all(trackIds.map((id) => AudiusBackend.deleteTrack(id)))
          console.debug('Deleted tracks.')
        } catch (err) {
          console.debug(`Could not delete all tracks: ${err}`)
        }
        yield put(pushRoute(ERROR_PAGE))
      }
    )
  )
}

function* uploadSingleTrack(track) {
  // Need an object to hold phase error info that
  // can get captured by confirmer closure
  // while remaining mutable.
  const phaseContainer = { phase: null }
  const progressChan = yield call(channel)

  // When the upload finishes, it should return
  // either a { track_id } or { error } object,
  // which is then used to upload stems if they exist.
  const responseChan = yield call(channel)

  const dispatcher = yield fork(actionChannelDispatcher, progressChan)
  const recordEvent = make(Name.TRACK_UPLOAD_TRACK_UPLOADING, {
    artworkSource: track.metadata.artwork.source,
    genre: track.metadata.genre,
    mood: track.metadata.mood,
    downloadable:
      track.metadata.download && track.metadata.download.is_downloadable
        ? track.metadata.download.requires_follow
          ? 'follow'
          : 'yes'
        : 'no'
  })
  yield put(recordEvent)

  yield put(
    confirmerActions.requestConfirmation(
      `${track.metadata.title}`,
      function* () {
        const { blockHash, blockNumber, trackId, error, phase } = yield call(
          AudiusBackend.uploadTrack,
          track.file,
          track.metadata.artwork.file,
          track.metadata,
          (loaded, total) => {
            progressChan.put(
              uploadActions.updateProgress(0, {
                loaded,
                total,
                status:
                  loaded !== total
                    ? ProgressStatus.UPLOADING
                    : ProgressStatus.PROCESSING
              })
            )
          }
        )

        if (error) {
          phaseContainer.phase = phase
          throw new Error(error)
        }

        const userId = yield select(getUserId)
        const handle = yield select(getUserHandle)
        const confirmed = yield call(confirmTransaction, blockHash, blockNumber)
        if (!confirmed) {
          throw new Error(`Could not confirm upload single track ${trackId}`)
        }

        return yield apiClient.getTrack({
          id: trackId,
          currentUserId: userId,
          unlistedArgs: {
            urlTitle: formatUrlName(track.metadata.title),
            handle
          }
        })
      },
      function* (confirmedTrack) {
        yield call(responseChan.put, { confirmedTrack })
      },
      function* ({ timeout, message }) {
        yield put(uploadActions.uploadTrackFailed())

        if (timeout) {
          yield put(uploadActions.singleTrackTimeoutError())
        } else {
          yield put(
            uploadActions.singleTrackUploadError(
              message,
              phaseContainer.phase,
              track.file.size
            )
          )
        }
        yield cancel(dispatcher)
        yield call(responseChan.put, { error: message })
      },
      () => {},
      UPLOAD_TIMEOUT_MILLIS
    )
  )

  const { confirmedTrack, error } = yield take(responseChan)

  yield reportSuccessAndFailureEvents({
    numSuccess: error ? 0 : 1,
    numFailure: error ? 1 : 0,
    uploadType: 'single_track',
    errors: error ? [error] : []
  })

  if (error) {
    return
  }

  const stems = yield select(getStems)
  if (stems.length) {
    yield call(uploadStems, {
      parentTrackIds: [confirmedTrack.track_id],
      stems
    })
  }

  // Finish up the upload
  progressChan.put(
    uploadActions.updateProgress(0, { status: ProgressStatus.COMPLETE })
  )
  yield put(
    uploadActions.uploadTracksSucceeded(confirmedTrack.track_id, [
      confirmedTrack
    ])
  )
  yield put(
    make(Name.TRACK_UPLOAD_COMPLETE_UPLOAD, {
      count: 1,
      kind: 'tracks'
    })
  )
  const account = yield select(getAccountUser)
  yield put(cacheActions.setExpired(Kind.USERS, account.user_id))

  if (confirmedTrack.download && confirmedTrack.download.is_downloadable) {
    yield put(tracksActions.checkIsDownloadable(confirmedTrack.track_id))
  }

  // If the hide remixes is turned on, send analytics event
  if (
    confirmedTrack.field_visibility &&
    !confirmedTrack.field_visibility.remixes
  ) {
    yield put(
      make(Name.REMIX_HIDE, {
        id: confirmedTrack.track_id,
        handle: account.handle
      })
    )
  }

  if (
    confirmedTrack.remix_of &&
    Array.isArray(confirmedTrack.remix_of.tracks) &&
    confirmedTrack.remix_of.tracks.length > 0
  ) {
    yield call(trackNewRemixEvent, confirmedTrack)
  }

  yield cancel(dispatcher)
}

export function* uploadStems({ parentTrackIds, stems }) {
  const updatedStems = updateAndFlattenStems(stems, parentTrackIds)

  const uploadedTracks = yield call(handleUploads, {
    tracks: updatedStems,
    isCollection: false,
    isStem: true
  })
  if (uploadedTracks.trackIds) {
    for (let i = 0; i < uploadedTracks.trackIds.length; i += 1) {
      const trackId = uploadedTracks.trackIds[i]
      const parentTrackId = updatedStems[i].metadata.stem_of.parent_track_id
      const category = updatedStems[i].metadata.stem_of.category
      const recordEvent = make(Name.STEM_COMPLETE_UPLOAD, {
        id: trackId,
        parent_track_id: parentTrackId,
        category
      })
      yield put(recordEvent)
    }
  }
}

function* uploadMultipleTracks(tracks) {
  const tracksWithMetadata = tracks.map((track) => ({
    track,
    metadata: track.metadata
  }))

  const { trackIds } = yield call(handleUploads, {
    tracks: tracksWithMetadata,
    isCollection: false
  })
  const stems = yield select(getStems)
  if (stems.length) {
    yield call(uploadStems, {
      parentTrackIds: trackIds,
      stems
    })
  }

  yield put(uploadActions.uploadTracksSucceeded())
  yield put(
    make(Name.TRACK_UPLOAD_COMPLETE_UPLOAD, {
      count: tracksWithMetadata.length,
      kind: 'tracks'
    })
  )
  const account = yield select(getAccountUser)

  // If the hide remixes is turned on, send analytics event
  for (let i = 0; i < tracks.length; i += 1) {
    const track = tracks[i]
    const trackId = trackIds[i]
    if (track.metadata?.field_visibility?.remixes === false) {
      yield put(
        make(Name.REMIX_HIDE, {
          id: trackId,
          handle: account.handle
        })
      )
    }
  }

  const remixTracks = tracks
    .map((t, i) => ({ track_id: trackIds[i], ...t.metadata }))
    .filter((t) => !!t.remix_of)
  if (remixTracks.length > 0) {
    for (const remixTrack of remixTracks) {
      if (
        Array.isArray(remixTrack.remix_of.tracks) &&
        remixTrack.remix_of.tracks.length > 0
      ) {
        yield call(trackNewRemixEvent, remixTrack)
      }
    }
  }

  yield put(cacheActions.setExpired(Kind.USERS, account.user_id))
}

function* uploadTracksAsync(action) {
  yield call(waitForBackendSetup)
  const user = yield select(getAccountUser)
  yield put(
    uploadActions.uploadTracksRequested(
      action.tracks,
      action.metadata,
      action.uploadType,
      action.stems
    )
  )

  // If user already has creator_node_endpoint, do not reselect replica set
  let newEndpoint = user.creator_node_endpoint || ''
  if (!newEndpoint) {
    const serviceSelectionStatus = yield select(getStatus)
    if (serviceSelectionStatus === Status.ERROR) {
      yield put(uploadActions.uploadTrackFailed())
      yield put(
        uploadActions.upgradeToCreatorError(
          'Failed to find creator nodes to upload to'
        )
      )
      return
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
      yield put(uploadActions.uploadTrackFailed())
      yield put(
        uploadActions.upgradeToCreatorError(
          'Failed to find creator nodes to upload to, after taking a long time'
        )
      )
      return
    }
    newEndpoint = selectedServices.join(',')
  }

  yield put(
    cacheActions.update(Kind.USERS, [
      {
        id: user.user_id,
        metadata: {
          creator_node_endpoint: newEndpoint
        }
      }
    ])
  )

  const uploadType = (() => {
    switch (action.uploadType) {
      case UploadType.PLAYLIST:
        return 'playlist'
      case UploadType.ALBUM:
        return 'album'
      case UploadType.INDIVIDUAL_TRACK:
      case UploadType.INDIVIDUAL_TRACKS:
      default:
        return 'tracks'
    }
  })()

  const recordEvent = make(Name.TRACK_UPLOAD_START_UPLOADING, {
    count: action.tracks.length,
    kind: uploadType
  })
  yield put(recordEvent)

  // Upload content.
  if (
    action.uploadType === UploadType.PLAYLIST ||
    action.uploadType === UploadType.ALBUM
  ) {
    const isAlbum = action.uploadType === UploadType.ALBUM
    yield call(
      uploadCollection,
      action.tracks,
      user.user_id,
      action.metadata,
      isAlbum
    )
  } else {
    if (action.tracks.length === 1) {
      yield call(uploadSingleTrack, action.tracks[0])
    } else {
      yield call(uploadMultipleTracks, action.tracks)
    }
  }
}

function* watchUploadTracks() {
  yield takeLatest(uploadActions.UPLOAD_TRACKS, uploadTracksAsync)
}

export default function sagas() {
  return [watchUploadTracks, watchUploadErrors]
}
