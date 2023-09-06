import type { DownloadReason, ID } from '@audius/common'
import {
  cacheCollectionsSelectors,
  accountSelectors,
  getContext
} from '@audius/common'
import { difference } from 'lodash'
import moment from 'moment'
import { call, put, race, select, take } from 'typed-redux-saga'

import { DOWNLOAD_REASON_FAVORITES } from 'app/store/offline-downloads/constants'
import { dispatch } from 'app/store/store'

import {
  getCollectionSyncStatus,
  getOfflineCollectionMetadata,
  getOfflineTrackMetadata,
  getOfflineTrackStatus
} from '../../../selectors'
import type { CollectionId, OfflineEntry } from '../../../slice'
import {
  OfflineDownloadStatus,
  completeCollectionSync,
  CollectionSyncStatus,
  errorCollectionSync,
  cancelCollectionSync,
  requestProcessNextJob,
  redownloadOfflineItems,
  addOfflineEntries,
  removeOfflineItems,
  startCollectionSync
} from '../../../slice'
import { shouldAbortJob } from '../../utils/shouldAbortJob'
import { shouldCancelJob } from '../../utils/shouldCancelJob'

const { getUserId } = accountSelectors
const { getCollection } = cacheCollectionsSelectors

const isTrackFavoriteReason = (downloadReason: DownloadReason) =>
  downloadReason.is_from_favorites &&
  downloadReason.collection_id === DOWNLOAD_REASON_FAVORITES

function* shouldAbortSync(collectionId: CollectionId) {
  while (true) {
    yield* take(removeOfflineItems.type)
    const syncStatus = yield* select(getCollectionSyncStatus, collectionId)
    if (!syncStatus) return true
  }
}

export function* syncCollectionWorker(collectionId: CollectionId) {
  yield* put(startCollectionSync({ id: collectionId }))

  const { jobResult, abortSync, abortJob, cancel } = yield* race({
    jobResult: call(syncCollectionAsync, collectionId),
    abortSync: call(shouldAbortSync, collectionId),
    abortJob: call(shouldAbortJob),
    cancel: call(shouldCancelJob)
  })

  if (abortSync || abortJob) {
    yield* put(requestProcessNextJob())
  } else if (cancel) {
    yield* put(cancelCollectionSync({ id: collectionId }))
  } else if (jobResult === CollectionSyncStatus.ERROR) {
    yield* put(errorCollectionSync({ id: collectionId }))
    yield* put(requestProcessNextJob())
  } else if (jobResult === CollectionSyncStatus.SUCCESS) {
    yield* put(completeCollectionSync({ id: collectionId }))
    yield* put(requestProcessNextJob())
  }
}

function* syncCollectionAsync(collectionId: CollectionId) {
  if (collectionId === DOWNLOAD_REASON_FAVORITES) {
    return yield* call(syncFavoritesCollection)
  } else {
    return yield* call(syncCollection, collectionId)
  }
}

function* syncFavoritesCollection() {
  const currentUserId = yield* select(getUserId)
  const apiClient = yield* getContext('apiClient')
  if (!currentUserId) return CollectionSyncStatus.ERROR
  const offlineTrackMetadata = yield* select(getOfflineTrackMetadata)

  const latestFavoritedTracks = yield* call(
    [apiClient, apiClient.getFavorites],
    { currentUserId, limit: 10000 }
  )

  if (!latestFavoritedTracks) return CollectionSyncStatus.ERROR

  const offlineFavoritedTrackIds = Object.keys(offlineTrackMetadata)
    .map((id) => parseInt(id, 10))
    .filter((id) =>
      offlineTrackMetadata[id].reasons_for_download.some(isTrackFavoriteReason)
    )

  const latestFavoritedTrackIds = latestFavoritedTracks.map(
    (favorite) => favorite.save_item_id
  )

  // Remove
  const trackIdsToRemove = difference(
    offlineFavoritedTrackIds,
    latestFavoritedTrackIds
  )

  const tracksToRemove: OfflineEntry[] = trackIdsToRemove.map((trackId) => ({
    type: 'track',
    id: trackId,
    metadata: {
      reasons_for_download: [
        { is_from_favorites: true, collection_id: DOWNLOAD_REASON_FAVORITES }
      ]
    }
  }))

  if (tracksToRemove.length > 0) {
    yield* put(removeOfflineItems({ items: tracksToRemove }))
  }

  // Add
  const trackIdsToAdd = difference(
    latestFavoritedTrackIds,
    offlineFavoritedTrackIds
  )

  const tracksToAdd: OfflineEntry[] = trackIdsToAdd.map((trackId) => ({
    type: 'track',
    id: trackId,
    metadata: {
      reasons_for_download: [
        { is_from_favorites: true, collection_id: DOWNLOAD_REASON_FAVORITES }
      ]
    }
  }))

  if (tracksToAdd.length > 0) {
    yield* put(addOfflineEntries({ items: tracksToAdd }))
  }

  return CollectionSyncStatus.SUCCESS
}

function* syncCollection(collectionId: ID) {
  const currentUserId = yield* select(getUserId)
  const apiClient = yield* getContext('apiClient')
  const currentCollection = yield* select(getCollection, { id: collectionId })
  if (!currentCollection || !currentUserId) return CollectionSyncStatus.ERROR

  const latestCollection = yield* call(
    [apiClient, apiClient.getCollectionMetadata],
    {
      collectionId,
      currentUserId,
      // Needed to ensure APIClient doesn't abort when we become unreachable,
      // allowing this job time to self-cancel
      abortOnUnreachable: false
    }
  )

  if (!latestCollection) return CollectionSyncStatus.ERROR

  if (
    moment(latestCollection.updated_at).isAfter(currentCollection.updated_at)
  ) {
    dispatch(
      redownloadOfflineItems({
        items: [{ type: 'collection', id: collectionId }]
      })
    )
  }

  // Even though updated_at should tell us when we need to update, we still
  // check tracks here to be extra safe. Sometimes tracks are missing on
  // initial download, and this sync helps ensure things stay more in sync

  const currentCollectionTrackIds =
    currentCollection.playlist_contents.track_ids.map(({ track }) => track)

  const latestCollectionTrackIds =
    latestCollection.playlist_contents.track_ids.map(({ track }) => track)

  const offlineCollectionMetadata = yield* select(getOfflineCollectionMetadata)
  const currentOfflineCollectionMetadata =
    offlineCollectionMetadata[collectionId]

  if (!currentOfflineCollectionMetadata) return CollectionSyncStatus.ERROR

  const trackDownloadReasons =
    currentOfflineCollectionMetadata.reasons_for_download.map(
      ({ is_from_favorites }) => ({
        collection_id: collectionId,
        is_from_favorites
      })
    )

  // Remove tracks
  const tracksIdsToRemove = difference(
    currentCollectionTrackIds,
    latestCollectionTrackIds
  )

  const trackItemsToRemove: OfflineEntry[] = tracksIdsToRemove.map(
    (trackId) => ({
      type: 'track',
      id: trackId,
      metadata: { reasons_for_download: trackDownloadReasons }
    })
  )

  if (trackItemsToRemove.length > 0) {
    dispatch(removeOfflineItems({ items: trackItemsToRemove }))
  }

  // Add tracks

  const offlineTrackStatus = yield* select(getOfflineTrackStatus)
  const currentOfflineCollectionTrackIds = currentCollectionTrackIds.filter(
    (id) =>
      id in offlineTrackStatus &&
      offlineTrackStatus[id] !== OfflineDownloadStatus.ERROR
  )

  const trackIdsToAdd = difference(
    latestCollectionTrackIds,
    currentOfflineCollectionTrackIds
  )

  const trackItemsToAdd: OfflineEntry[] = trackIdsToAdd.map((trackId) => ({
    type: 'track',
    id: trackId,
    metadata: { reasons_for_download: trackDownloadReasons }
  }))

  if (trackItemsToAdd.length > 0) {
    dispatch(addOfflineEntries({ items: trackItemsToAdd }))
  }

  return CollectionSyncStatus.SUCCESS
}
