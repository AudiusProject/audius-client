import { ThunkAction } from '@reduxjs/toolkit'
import { Action } from 'redux'
import { put as putBase } from 'typed-redux-saga'

export function* put(action: Action | ThunkAction<any, any, any, any>) {
  // @ts-expect-error
  return yield* putBase(action)
}
