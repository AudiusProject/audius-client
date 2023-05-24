import { chatActions, chatSagas, waitForRead } from "@audius/common"
import { call, takeLatest } from 'typed-redux-saga'
import { retrieveCollections } from '../../cache/collections/utils'

const { fetchCollection } = chatActions

function* doFetchCollection(
  action: ReturnType<typeof fetchCollection>
) {
  yield waitForRead()

  yield* call(retrieveCollections, [action.payload.id])
}

function* watchFetchCollection() {
  yield takeLatest(fetchCollection, doFetchCollection)
}

export default function sagas() {
  return [
    ...chatSagas(),
    watchFetchCollection
  ]
}
