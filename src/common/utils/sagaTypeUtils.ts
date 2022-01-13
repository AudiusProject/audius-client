/**
 * @file Utility methods for typing Sagas
 * @author Drew Colthorp (@dcolthorp)
 * Taken/Adapted from:
 * https://spin.atomicobject.com/2020/08/06/redux-saga-call-effect/
 */

import { Effect } from 'redux-saga'

/** Strip any saga effects from a type; this is typically useful to get the return type of a saga. */
type StripEffects<T> = T extends IterableIterator<infer E>
  ? E extends Effect
    ? never
    : E
  : never

/** Unwrap the type to be consistent with the runtime behavior of a call. */
type DecideReturn<T> = T extends Promise<infer R>
  ? R // If it's a promise, return the promised type.
  : T extends IterableIterator<any>
  ? StripEffects<T> // If it's a generator, strip any effects to get the return type.
  : T // Otherwise, it's a normal function and the return type is unaffected.

/**
 * Determine the return type of yielding a call effect to the provided function.
 * @example const foo: CallReturnType<typeof func> = yield call(func, ...)
 */
export type CallReturnType<T extends (...args: any[]) => any> = DecideReturn<
  ReturnType<T>
>
