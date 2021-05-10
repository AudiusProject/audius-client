import { delay } from 'redux-saga'
import { call, put, race, select, takeEvery } from 'redux-saga/effects'

import AudiusBackend from 'services/AudiusBackend'
import { waitForValue } from 'utils/sagaHelpers'
import * as confirmerActions from 'store/confirmer/actions'
import {
  getResult,
  getCommandChain,
  getIndexEquals,
  getConfirmLength,
  getIsDone
} from 'store/confirmer/selectors'
import apiClient from 'services/audius-api-client/AudiusAPIClient'

const BlockConfirmation = Object.freeze({
  CONFIRMED: 'CONFIRMED',
  DENIED: 'DENIED',
  UNKNOWN: 'UNKNOWN'
})

const POLLING_FREQUENCY_MILLIS = 2000

/* Exported  */

/**
 * Polls a playlist in discprov and checks for existence as well as whether a custom check
 * on the playlist is fulfilled.
 * @param {number} playlistId
 * @param {?number} userId playlist owner id. Can be null ONLY if the playlist is PUBLIC.
 * @param {function} check single argument function that takes a playlist and returns a boolean.
 */
export function* pollPlaylist(
  playlistId,
  userId,
  check = playlist => playlist
) {
  let playlists = yield call(AudiusBackend.getPlaylists, userId, [playlistId])
  while (playlists.length === 0 || !check(playlists[0])) {
    yield delay(POLLING_FREQUENCY_MILLIS)
    playlists = yield call(AudiusBackend.getPlaylists, userId, [playlistId])
  }
  return playlists[0]
}

/**
 * Polls a user in discprov and checks for existence as well as whether a custom check
 * on the user is fulfilled.
 * @param {number} userId
 * @param {function} check single argument function that takes a user and returns a boolean.
 */
export function* pollUser(userId, check = user => user) {
  let users = yield call(AudiusBackend.getCreators, [userId])
  while (users.length === 0 || !check(users[0])) {
    yield delay(POLLING_FREQUENCY_MILLIS)
    users = yield call(AudiusBackend.getCreators, [userId])
  }
  return users[0]
}

export function* confirmTransaction(blockHash, blockNumber) {
  /**
   * Assume confirmation when there is nothing to confirm
   */
  if (!blockHash || !blockNumber) return true

  function* confirmBlock() {
    const { block_found, block_passed } = yield apiClient.getBlockConfirmation(
      blockHash,
      blockNumber
    )

    return block_found
      ? BlockConfirmation.CONFIRMED
      : block_passed
      ? BlockConfirmation.DENIED
      : BlockConfirmation.UNKNOWN
  }

  let confirmation = yield call(confirmBlock)
  while (confirmation === BlockConfirmation.UNKNOWN) {
    yield delay(POLLING_FREQUENCY_MILLIS)
    confirmation = yield call(confirmBlock)
  }
  return confirmation === BlockConfirmation.CONFIRMED
}

/* Private */

// Makes a call and races a confirmation callback against a timeout, enqueues requests with
// matching uid's and allows them to resolve sequentially.
function* requestConfirmationAsync(action) {
  const {
    uid,
    confirmationCall,
    successCall,
    failCall,
    previousResultSelector,
    timeoutMillis
  } = action

  // Get the "queue" length
  const length = yield select(getConfirmLength, { uid: uid })

  yield put(confirmerActions.addConfirmationCall(uid, confirmationCall))

  // Wait for previous call
  yield call(waitForValue, getIndexEquals, { uid: uid, index: length })
  const previousCallResult = yield call(waitForValue, getResult, {
    uid: uid,
    index: length - 1
  })
  let result, completionCall
  try {
    const { confirmationResult, timeout } = yield race({
      confirmationResult: call(
        confirmationCall,
        previousResultSelector(previousCallResult)
      ),
      timeout: delay(timeoutMillis, true)
    })
    if (!timeout) {
      result = confirmationResult
      completionCall = successCall
    } else {
      result = { error: true, timeout: true }
      completionCall = failCall
    }
  } catch (err) {
    console.debug(`Caught error in confirmer: ${err}`)
    result = { error: true, message: err.message, timeout: false }
    completionCall = failCall
  }

  yield put(confirmerActions.setConfirmationResult(uid, result))
  yield put(
    confirmerActions.addCompletionCall(uid, call(completionCall, result))
  )

  // if no children
  const isDone = yield select(getIsDone, { uid: uid })
  if (isDone) {
    const commandChain = yield select(getCommandChain, { uid: uid })
    for (let i = 0; i < commandChain.length; ++i) {
      yield commandChain[i]
    }
    yield put(confirmerActions.clear(uid))
  }
}

export function* watchRequestConfirmation() {
  yield takeEvery(
    confirmerActions.REQUEST_CONFIRMATION,
    requestConfirmationAsync
  )
}

export default function sagas() {
  return [watchRequestConfirmation]
}
