import { put, takeEvery, delay } from 'typed-redux-saga'

import { uuid } from 'common/utils/uid'

import { addToast, dismissToast, toast, ToastAction } from './slice'

const TOAST_TIMEOUT = 10000

function* handleToast(action: ToastAction) {
  const { content, timeout = TOAST_TIMEOUT } = action.payload
  const toast = { content, key: uuid() }
  yield* put(addToast(toast))
  yield delay(timeout)
  yield* put(dismissToast({ key: toast.key }))
}

function* watchHandleToast() {
  yield* takeEvery(toast, handleToast)
}

export default function sagas() {
  return [watchHandleToast]
}
