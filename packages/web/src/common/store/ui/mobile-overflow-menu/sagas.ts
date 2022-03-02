import { put, takeEvery } from 'typed-redux-saga'

import { setVisibility } from 'common/store/ui/modals/slice'

import { open } from './slice'

function* handleOpen() {
  yield* put(setVisibility({ modal: 'Overflow', visible: true }))
}

function* watchHandleOpen() {
  yield* takeEvery(open, handleOpen)
}

export default function sagas() {
  return [watchHandleOpen]
}
