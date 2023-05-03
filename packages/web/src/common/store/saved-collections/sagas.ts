import {
  FetchCollectionsPayload,
  savedCollectionsActions,
  waitForRead
} from '@audius/common'
import { PayloadAction } from '@reduxjs/toolkit'
import { call, put, takeEvery } from 'typed-redux-saga'

import { retrieveCollections } from '../cache/collections/utils'

const { fetchCollections, fetchCollectionsSucceeded } = savedCollectionsActions

function* fetchCollectionsAsync(
  action: PayloadAction<FetchCollectionsPayload>
) {
  const { type, ids } = action.payload
  yield waitForRead()

  // TODO: How do we catch errors?
  // TODO: What happens if we don't return all the collections requested?
  yield* call(retrieveCollections, null, ids)
  yield* put(
    fetchCollectionsSucceeded({
      type
    })
  )
}

function* watchFetchCollections() {
  yield takeEvery(fetchCollections.type, fetchCollectionsAsync)
}

export const sagas = () => {
  return [watchFetchCollections]
}
