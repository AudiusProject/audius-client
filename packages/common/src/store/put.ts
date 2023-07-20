import { ThunkAction } from '@reduxjs/toolkit'
import { Action } from 'redux'
import { call, select, put as putBase } from 'typed-redux-saga'

export function* put(action: Action | ThunkAction<any, any, any, any>) {
  if (typeof action === 'function') {
    const state = yield* select((state) => state)
    yield* call(action, put, () => state, undefined)
  } else {
    yield* putBase(action)
  }
}
