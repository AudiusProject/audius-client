import { call, delay, put, race, select, takeEvery } from 'redux-saga/effects'

import apiClient from 'services/audius-api-client/AudiusAPIClient'
import * as confirmerActions from 'store/confirmer/actions'
import {
  getResult,
  getCommandChain,
  getIndexEquals,
  getConfirmLength,
  getIsDone,
  getLatestResult,
  getShouldCancelCurrentCall,
  getAreRequisiteCallsComplete
} from 'store/confirmer/selectors'
import { waitForValue } from 'utils/sagaHelpers'

enum BlockConfirmation {
  CONFIRMED = 'CONFIRMED',
  DENIED = 'DENIED',
  UNKNOWN = 'UNKNOWN'
}

const POLLING_FREQUENCY_MILLIS = 2000

/* Exported  */

export function* confirmTransaction(blockHash: string, blockNumber: number) {
  /**
   * Assume confirmation when there is nothing to confirm
   */
  if (!blockHash || !blockNumber) return true

  function* confirmBlock(): Generator<any, BlockConfirmation, any> {
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

  let confirmation: BlockConfirmation = yield call(confirmBlock)
  while (confirmation === BlockConfirmation.UNKNOWN) {
    yield delay(POLLING_FREQUENCY_MILLIS)
    confirmation = yield call(confirmBlock)
  }
  return confirmation === BlockConfirmation.CONFIRMED
}

/* Private */

// Makes a call and races a confirmation callback against a timeout, enqueues requests with
// matching uid's and allows them to resolve in a manner according to the options passed in `action.confirmationOptions`.
function* requestConfirmationAsync(
  action: ReturnType<typeof confirmerActions.requestConfirmation>
) {
  const {
    uid,
    confirmationCall,
    successCall,
    failCall,
    previousResultSelector,
    timeoutMillis,
    confirmationOptions
  } = action
  const { parallelizable, useOnlyLastSuccessCall, operationId } =
    confirmationOptions

  // Get the "queue" length
  const nextCallIndex: number = yield select(getConfirmLength, { uid })
  yield put(
    confirmerActions._addConfirmationCall(
      uid,
      confirmationCall,
      confirmationOptions
    )
  )

  // Wait until we're able to process this call
  yield call(waitForValue, getIndexEquals, { uid, index: nextCallIndex })
  // If necessary, wait until calls that are required to resolve before this one are complete.
  // (Step into `getAreRequisiteCallsComplete` documentation for more info.)
  yield call(waitForValue, getAreRequisiteCallsComplete, {
    uid,
    index: nextCallIndex
  })
  let result, completionCall, success
  const shouldCancelCurrentCall: boolean | undefined = yield select(
    getShouldCancelCurrentCall,
    { uid }
  )

  if (shouldCancelCurrentCall) {
    yield put(confirmerActions._cancelConfirmationCall(uid, nextCallIndex))
  } else {
    let previousCallResult: unknown
    if (parallelizable) {
      previousCallResult = yield select(getLatestResult, { uid })
    } else {
      previousCallResult = yield call(waitForValue, getResult, {
        uid,
        index: nextCallIndex - 1
      })
    }
    try {
      if (parallelizable) {
        // If this call is parallelizable, increment the current index of the confirm group
        // so that the next call can potentially be run without having to wait for this one.
        yield put(confirmerActions._incrementConfirmGroupIndex(uid))
      }
      const { confirmationResult, timeout } = yield race({
        confirmationResult: call(
          confirmationCall,
          previousResultSelector(previousCallResult)
        ),
        timeout: delay(timeoutMillis, true)
      })
      if (!timeout) {
        result = confirmationResult
        success = true
        completionCall = successCall
      } else {
        result = { error: true, timeout: true }
        success = false
        completionCall = failCall
      }
    } catch (err) {
      console.debug('Caught error in confirmer:', err)
      result = {
        error: true,
        message: err instanceof Error ? err.message : '',
        timeout: false
      }
      success = false
      completionCall = failCall
    }

    yield put(
      confirmerActions._setConfirmationResult(
        uid,
        result,
        nextCallIndex,
        /** shouldIncrementConfirmGroupIndex = */ !parallelizable
      )
    )
    if (success && useOnlyLastSuccessCall && operationId) {
      // Ensure that only the success callback of the last call with `operationId` to resolve
      // gets called at the end (when `isDone` below is true):
      yield put(
        confirmerActions._setOperationSuccessCall(
          uid,
          operationId,
          call(completionCall, result)
        )
      )
    } else {
      yield put(
        confirmerActions._addCompletionCall(uid, call(completionCall, result))
      )
    }

    // If no more calls in the confirm group:
    const isDone: boolean = yield select(getIsDone, { uid })
    if (isDone) {
      const commandChain: any[] = yield select(getCommandChain, { uid })
      for (let i = 0; i < commandChain.length; ++i) {
        if (commandChain[i]) {
          yield commandChain[i]
        }
      }
      yield put(confirmerActions._clearComplete(uid, commandChain.length - 1))

      // Check again if all calls are done since more might have been added between completion calls.
      const isStillDone: boolean = yield select(getIsDone, { uid })
      if (isStillDone) {
        yield put(confirmerActions._clearConfirm(uid))
      }
    }
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
