import { collectionsSocialActions } from '@audius/common'
import { takeEvery } from 'typed-redux-saga'

import { removeFavoritedDownloadedCollection } from './requestRemoveFavoritedDownloadedCollectionSaga'

const { UNSAVE_COLLECTION } = collectionsSocialActions

export function* watchUnsaveCollectionSaga() {
  yield* takeEvery(UNSAVE_COLLECTION, removeFavoritedDownloadedCollection)
}
