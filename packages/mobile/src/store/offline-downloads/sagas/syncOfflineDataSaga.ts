import type { CommonState } from '@audius/common'
import { waitForValue } from '@audius/common'
import { waitForBackendSetup } from 'audius-client/src/common/store/backend/sagas'
import { waitForRead } from 'audius-client/src/utils/sagaHelpers'
import { difference, intersection } from 'lodash'
import { call, put, select } from 'typed-redux-saga'

import { DOWNLOAD_REASON_FAVORITES } from 'app/services/offline-downloader'

import { getOfflineCollectionsStatus } from '../selectors'
import type { CollectionId } from '../slice'
import {
  addOfflineItems,
  removeOfflineItems,
  addCollectionSyncs,
  doneLoadingFromDisk
} from '../slice'

export function* syncOfflineDataSaga() {
  yield* call(waitForValue, doneLoadingFromDisk)
  yield* waitForRead()
  yield* waitForBackendSetup()

  const accountCollections = yield* select(
    (state: CommonState) => state.account.collections
  )
  const collectionStatus = yield* select(getOfflineCollectionsStatus)

  const offlineCollectionIds = Object.keys(collectionStatus)
    .filter((id) => id !== DOWNLOAD_REASON_FAVORITES)
    .map(parseInt)

  const accountCollectionIds = Object.keys(accountCollections).map(parseInt)

  // Remove
  const collectionIdsToRemove = difference(
    offlineCollectionIds,
    accountCollectionIds
  )

  if (collectionIdsToRemove.length > 0) {
    yield* put(
      removeOfflineItems({
        items: collectionIdsToRemove.map((id) => ({
          type: 'collection',
          id,
          metadata: {
            reasons_for_download: [
              { is_from_favorites: true },
              { is_from_favorites: false }
            ]
          }
        }))
      })
    )
  }

  // Sync
  const collectionIdsToSync: CollectionId[] = intersection(
    offlineCollectionIds,
    accountCollectionIds
  )

  if (collectionStatus[DOWNLOAD_REASON_FAVORITES]) {
    collectionIdsToSync.unshift(DOWNLOAD_REASON_FAVORITES)
  }

  if (collectionIdsToSync.length > 0) {
    yield* put(
      addCollectionSyncs({ items: collectionIdsToSync.map((id) => ({ id })) })
    )
  }

  // Add
  if (collectionStatus[DOWNLOAD_REASON_FAVORITES]) {
    const collectionIdsToAdd = difference(
      accountCollectionIds,
      offlineCollectionIds
    )

    if (collectionIdsToAdd.length > 0) {
      yield* put(
        addOfflineItems({
          items: collectionIdsToAdd.map((id) => ({
            type: 'collection',
            id,
            metadata: { reasons_for_download: [{ is_from_favorites: true }] }
          }))
        })
      )
    }
  }
}
