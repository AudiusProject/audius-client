import { findLastIndex } from 'lodash'

import { AppState } from 'store/types'

// Confirmer selectors

/** Check whether anything is confirming so UI can block reloads. */
export const getIsConfirming = (state: AppState) =>
  Object.keys(state.confirmer.confirm).length > 0

export const getResult = (
  state: AppState,
  props: { uid: number | string; index: number }
) => {
  if (!(props.uid in state.confirmer.confirm) || props.index < 0) {
    return {}
  }
  const calls = state.confirmer.confirm[props.uid].calls
  const resultIndex = findLastIndex(
    calls,
    (c) => c.cancelled !== true,
    props.index
  )
  return resultIndex === -1 ? {} : calls[resultIndex].result
}

export const getLatestResult = (
  state: AppState,
  props: { uid: number | string }
) => {
  if (!(props.uid in state.confirmer.confirm)) {
    return {}
  }

  const calls = state.confirmer.confirm[props.uid].calls
  const lastCallResultIndex = findLastIndex(calls, (c) => c.result !== null)
  return lastCallResultIndex === -1 ? {} : calls[lastCallResultIndex].result
}

/** Returns `true` if we can cancel the current call
 * - that is, if the next call is also squashable and has the same operation ID.
 * Returns `undefined` if invalid uid or there is no next call.
 * Otherwise, returns `false`. */
export const getShouldCancelCurrentCall = (
  state: AppState,
  props: { uid: number | string }
) => {
  if (!(props.uid in state.confirmer.confirm)) {
    return undefined
  }
  const confirmGroup = state.confirmer.confirm[props.uid]
  const currentCall =
    confirmGroup.index < 0 || confirmGroup.index >= confirmGroup.calls.length
      ? null
      : confirmGroup.calls[confirmGroup.index]
  if (currentCall == null) {
    return undefined
  }
  const nextCall =
    confirmGroup.index + 1 >= confirmGroup.calls.length
      ? null
      : confirmGroup.calls[confirmGroup.index + 1]
  if (nextCall === null) {
    return false
  }
  if (
    currentCall.squashable &&
    nextCall.squashable &&
    currentCall.operationId === nextCall.operationId
  ) {
    return true
  }
}

export const getIndexEquals = (
  state: AppState,
  props: { uid: number | string; index: number }
) =>
  props.uid in state.confirmer.confirm
    ? state.confirmer.confirm[props.uid].index === props.index
    : false

export const getConfirmLength = (
  state: AppState,
  props: { uid: string | number }
): number =>
  props.uid in state.confirmer.confirm
    ? state.confirmer.confirm[props.uid].calls.length
    : 0

/** If the current call is NOT parallelizable: check if all calls before the current one (at index) have been resolved.
 * If the current call IS parallelizable: check if all calls before the current one that DO
 * NOT share the same `operationId` are resolved (i.e. we do not need previous paralellizable
 * calls of the same operation id to be resolved).
 */
export const getAreRequisiteCallsComplete = (
  state: AppState,
  props: {
    uid: string | number
    index: number
  }
) => {
  if (!(props.uid in state.confirmer.confirm) || props.index <= 0) {
    return true
  }
  const currentCall = state.confirmer.confirm[props.uid].calls[props.index]
  if (!currentCall) {
    return false
  }
  return state.confirmer.confirm[props.uid].calls
    .slice(0, props.index)
    .every(
      (call) =>
        call.result !== null ||
        call.cancelled === true ||
        (currentCall.parallelizable &&
          call.parallelizable &&
          currentCall.operationId === call.operationId)
    )
}

export const getIsDone = (state: AppState, props: { uid: string | number }) =>
  props.uid in state.confirmer.confirm
    ? state.confirmer.confirm[props.uid].calls.every(
        (call) => call.result !== null || call.cancelled === true
      )
    : true

export const getCommandChain = (
  state: AppState,
  props: { uid: string | number }
) =>
  props.uid in state.confirmer.complete
    ? state.confirmer.complete[props.uid]
    : []

export const getConfirmCalls = (state: AppState) => state.confirmer.confirm
