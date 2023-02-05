import type { ID } from '@audius/common'
import { takeEvery, select, put, call } from 'typed-redux-saga'

import type { TrackForDownload } from 'app/services/offline-downloader'
import {
  cancelQueuedCollectionDownloads,
  cancelQueuedTrackDownloads
} from 'app/services/offline-downloader'

import { getOfflineTrackMetadata, getOfflineTracks } from '../selectors'
import type {
  CollectionAction,
  OfflineItem,
  RequestRemoveFavoritedDownloadedCollectionAction,
  TrackReasonsToUpdate
} from '../slice'
import {
  removeOfflineItems,
  removeCollectionDownloads,
  removeTrackDownloads,
  updateTrackDownloadReasons,
  requestRemoveFavoritedDownloadedCollection
} from '../slice'

export function* requestRemoveFavoritedDownloadedCollectionSaga() {
  yield* takeEvery(
    requestRemoveFavoritedDownloadedCollection.type,
    removeFavoritedDownloadedCollection
  )
}

function* removeFavoritedDownloadedCollection(action: CollectionAction) {
  const { collectionId } = action.payload

  const offlineItemsToRemove: OfflineItem[] = []

  offlineItemsToRemove.push({
    type: 'collection',
    id: collectionId,
    metadata: {
      reasons_for_download: [
        { is_from_favorites: false },
        { is_from_favorites: true }
      ]
    }
  })

  const offlineTrackMetadata = yield* select(getOfflineTrackMetadata)
  const offlineTrackIds = Object.keys(offlineTrackMetadata).map((id) =>
    parseInt(id, 10)
  )

  for (const offlineTrackId of offlineTrackIds) {
    offlineItemsToRemove.push({
      type: 'track',
      id: offlineTrackId,
      metadata: {
        reasons_for_download: [
          { collection_id: collectionId, is_from_favorites: false },
          { collection_id: collectionId, is_from_favorites: true }
        ]
      }
    })
  }

  yield* put(removeOfflineItems({ items: offlineItemsToRemove }))
}
