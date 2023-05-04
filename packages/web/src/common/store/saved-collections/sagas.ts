import {
  FetchCollectionsPayload,
  savedCollectionsActions,
  waitForRead
} from '@audius/common'
import { PayloadAction } from '@reduxjs/toolkit'
import { chunk } from 'lodash'
import { call, put, takeEvery } from 'typed-redux-saga'

import { retrieveCollections } from '../cache/collections/utils'

const { fetchCollections, fetchCollectionsSucceeded } = savedCollectionsActions

// Attempting to fetch more than this amount at once could result in a 400
// due to the URL being too long.
const COLLECTIONS_BATCH_LIMIT = 50

function* fetchCollectionsAsync(
  action: PayloadAction<FetchCollectionsPayload>
) {
  const { type, ids } = action.payload
  yield waitForRead()

  // TODO: How do we catch errors?
  // TODO: What happens if we don't return all the collections requested?

  // Request ids in chunks if we're asked for too many
  const chunks = chunk(ids, COLLECTIONS_BATCH_LIMIT)
  for (let i = 0; i < chunks.length; i += 1) {
    yield call(retrieveCollections, null, chunks[i])
  }

  yield put(
    fetchCollectionsSucceeded({
      type
    })
  )
}

function* watchFetchCollections() {
  yield takeEvery(fetchCollections.type, fetchCollectionsAsync)
}

export default function sagas() {
  return [watchFetchCollections]
}
