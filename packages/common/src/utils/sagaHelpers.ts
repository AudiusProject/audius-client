/** Helper Sagas */

import { eventChannel, END, EventChannel } from 'redux-saga'
import { ActionPattern } from 'redux-saga/effects'
import {
  all,
  call,
  delay,
  put,
  select,
  spawn,
  take,
  takeEvery
} from 'typed-redux-saga'
import { Action } from 'typesafe-actions'

import { CommonState } from 'store'

import { Status } from '../models/Status'

/**
 * Calls the provided array of calls in batches with delayMs milliseconds between each batch.
 */
export function* batchYield(
  calls: Generator[],
  batchSize: number,
  delayMs: number
) {
  let remainingCalls = calls
  while (remainingCalls.length > 0) {
    yield all(remainingCalls.slice(0, batchSize))
    remainingCalls = remainingCalls.slice(batchSize)
    yield delay(delayMs)
  }
}

/**
 * Takes a channel that yields the value of a Redux action, waits for it to yield and then
 * dispatches the action.
 * @param {Object} channel
 */
export function* actionChannelDispatcher(channel: EventChannel<Action<any>>) {
  while (true) {
    const action: Action<any> = yield take(channel)
    yield put(action)
  }
}

export function* channelCanceller(
  channel: EventChannel<Action<any>>,
  action: ActionPattern<Action<any>>
) {
  yield take(action)
  channel.close()
}

/**
 * Waits for the selector to return a truthy value.
 * @param {function} selector
 * @param {object} args passed on to the selector
 * @param {(v: any) => bool} customCheck special check to run rather than checking truthy-ness
 */
export function* waitForValue<TValue>(
  selector: (
    state: CommonState,
    selectorArgs: Record<any, unknown> | null
  ) => TValue,
  args: Record<any, unknown> | null = {},
  customCheck: (value: TValue) => boolean = () => true
) {
  let value = yield* select(selector, args)
  while (!value || !customCheck(value)) {
    yield* take()
    value = yield* select(selector, args)
  }
  return value
}

function doEveryImpl(millis: number, times: number | null) {
  return eventChannel((emitter) => {
    // Emit once at the start
    emitter(times || true)

    // Emit once every millis
    const iv = setInterval(() => {
      if (times !== null) {
        times -= 1
      }
      if (times === null || times > 0) {
        emitter(times || true)
      } else {
        emitter(END)
      }
    }, millis)
    return () => {
      clearInterval(iv)
    }
  })
}

/**
 * Repeatedly calls a saga/async function on an interval for up to a set number of times.
 * @param {number} millis
 * @param {function *} fn
 * @param {number?} times
 */
export function* doEvery(
  millis: number,
  fn: (...args: any) => any,
  times: number | null = null
) {
  const chan: EventChannel<any> = yield call(doEveryImpl, millis, times)
  yield spawn(function* () {
    yield takeEvery(chan, fn)
  })
  return chan
}

export function* waitForAccount() {
  yield call(
    waitForValue,
    (state) => state.account.status,
    null,
    (status) => status !== Status.LOADING
  )
}
