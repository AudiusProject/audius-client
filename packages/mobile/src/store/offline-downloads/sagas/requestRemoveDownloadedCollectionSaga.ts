import type { ID } from '@audius/common'
import { takeEvery, select, put, call } from 'typed-redux-saga'

import type { TrackForDownload } from 'app/services/offline-downloader'
import {
  cancelQueuedTrackDownloads,
  cancelQueuedCollectionDownloads
} from 'app/services/offline-downloader'

import { getOfflineTrackMetadata, getOfflineTracks } from '../selectors'
import type {
  CollectionAction,
  OfflineItem,
  RequestRemoveDownloadedCollectionAction,
  TrackReasonsToUpdate
} from '../slice'
import {
  removeOfflineItems,
  updateTrackDownloadReasons,
  removeTrackDownloads,
  removeCollectionDownloads,
  requestRemoveDownloadedCollection
} from '../slice'

export function* requestRemoveDownloadedCollectionSaga() {
  yield* takeEvery(
    requestRemoveDownloadedCollection.type,
    removeDownloadedCollectionWorker
  )
}

function* removeDownloadedCollectionWorker(action: CollectionAction) {
  const { collectionId } = action.payload

  const offlineItemsToRemove: OfflineItem[] = []

  offlineItemsToRemove.push({
    type: 'collection',
    id: collectionId,
    metadata: { reasons_for_download: [{ is_from_favorites: false }] }
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
          { collection_id: collectionId, is_from_favorites: false }
        ]
      }
    })
  }

  yield* put(removeOfflineItems({ items: offlineItemsToRemove }))
}

function* removeDownloadedCollectionWorker2(
  action: RequestRemoveDownloadedCollectionAction
) {
  const { collectionId } = action.payload
  const collectionIdString = `${collectionId}`

  const offlineTracks = yield* select(getOfflineTracks)
  const offlineTrackList = Object.keys(offlineTracks).map(
    (offlineTrackId) => offlineTracks[offlineTrackId]
  )

  const tracksToRemove: ID[] = []
  const tracksToUpdate: TrackReasonsToUpdate[] = []
  const tracksToDequeue: TrackForDownload[] = []

  for (const offlineTrack of offlineTrackList) {
    if (!offlineTrack) continue
    const { track_id, offline } = offlineTrack
    if (!offline) continue
    const { reasons_for_download } = offline

    const remainingReasons = reasons_for_download.filter((reason) => {
      const { is_from_favorites, collection_id } = reason
      return !(
        is_from_favorites &&
        collection_id &&
        collection_id === collectionIdString
      )
    })

    if (remainingReasons.length === 0) {
      tracksToRemove.push(track_id)
    } else {
      tracksToUpdate.push({
        trackId: track_id,
        reasons_for_download: remainingReasons
      })
    }

    tracksToDequeue.push({
      trackId: track_id,
      downloadReason: {
        is_from_favorites: false,
        collection_id: collectionIdString
      }
    })
  }

  // TODO check collection downloads instead of unconditionally deleting
  yield* put(removeCollectionDownloads({ collectionIds: [collectionId] }))

  if (tracksToRemove.length > 0) {
    yield* put(removeTrackDownloads({ trackIds: tracksToRemove }))
  }

  if (tracksToUpdate.length > 0) {
    yield* put(updateTrackDownloadReasons({ reasons: tracksToUpdate }))
  }

  yield* call(cancelQueuedCollectionDownloads, [
    { collectionId, isFavoritesDownload: false }
  ])

  yield* call(cancelQueuedTrackDownloads, tracksToDequeue)
}
