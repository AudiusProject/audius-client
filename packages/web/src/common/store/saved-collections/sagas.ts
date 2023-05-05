import {
  FetchCollectionsPayload,
  ID,
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

/** Fetches an arbitrarily long list of collection ids in reasonably-sized chunks. Helpful both to
 * reduce request load and prevent errors from extremely long URLs.
 */
export function* fetchCollectionChunks(ids: ID[]) {
  // Request ids in chunks if we're asked for too many
  const chunks = chunk(ids, COLLECTIONS_BATCH_LIMIT)
  for (let i = 0; i < chunks.length; i += 1) {
    yield call(retrieveCollections, null, chunks[i])
  }
}

function* fetchCollectionsAsync(
  action: PayloadAction<FetchCollectionsPayload>
) {
  const { type, ids } = action.payload
  yield waitForRead()

  yield* fetchCollectionChunks(ids)

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
