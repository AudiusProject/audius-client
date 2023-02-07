import type { ID } from '@audius/common'
import {
  accountSelectors,
  getContext,
  reachabilityActions
} from '@audius/common'
import { select, call, put, take, race, cancelled } from 'typed-redux-saga'

import {
  downloadCollectionCoverArt,
  DownloadCollectionError,
  purgeDownloadedCollection,
  writeCollectionJson,
  writeFavoritesCollectionJson
} from 'app/services/offline-downloader'

import { getCollectionOfflineDownloadStatus } from '../../selectors'
import type { CollectionId } from '../../slice'
import {
  OfflineDownloadStatus,
  cancelDownload,
  removeOfflineItems,
  completeDownload,
  downloadQueuedItem,
  errorDownload,
  startDownload
} from '../../slice'
const { SET_UNREACHABLE } = reachabilityActions

const { getUserId } = accountSelectors

function* shouldCancel(collectionId: CollectionId) {
  while (true) {
    yield* take(removeOfflineItems.type)
    const trackStatus = yield* select(
      getCollectionOfflineDownloadStatus(collectionId)
    )
    if (!trackStatus) return
  }
}

export function* downloadCollectionWorker(collectionId: CollectionId) {
  yield* put(startDownload({ type: 'collection', id: collectionId }))
  const { downloadCollection, unreachable, cancel } = yield* race({
    downloadCollection: call(downloadCollectionWorkerInternal, collectionId),
    unreachable: take(SET_UNREACHABLE),
    cancel: call(shouldCancel, collectionId)
  })
  if (
    cancel ||
    unreachable ||
    downloadCollection === OfflineDownloadStatus.ERROR
  ) {
    yield* put(cancelDownload({ type: 'collection', id: collectionId }))
    purgeDownloadedCollection(collectionId.toString())
  }
  if (downloadCollection === OfflineDownloadStatus.SUCCESS) {
    yield* put(completeDownload({ type: 'collection', id: collectionId }))
    yield* put(downloadQueuedItem())
  }
}

// TODO add favorites collection task
export function* downloadCollectionWorkerInternal(collectionId: CollectionId) {
  // "favorites" collection short circuit
  if (typeof collectionId === 'string') {
    yield* call(writeFavoritesCollectionJson)
    return
  }

  const currentUserId = yield* select(getUserId)
  const apiClient = yield* getContext('apiClient')
  const [collection] = yield* call([apiClient, apiClient.getPlaylist], {
    playlistId: collectionId,
    currentUserId
  })

  if (!collection) {
    yield* call(collectionDownloadFailed, {
      id: collectionId,
      message: `collection to download not found on discovery - ${collectionId}`,
      error: DownloadCollectionError.FAILED_TO_FETCH
    })
    return OfflineDownloadStatus.ERROR
  }
  if (collection.is_delete) {
    yield* call(collectionDownloadFailed, {
      id: collectionId,
      message: `collection to download is deleted - ${collectionId}`,
      error: DownloadCollectionError.IS_DELETED
    })
    return OfflineDownloadStatus.ERROR
  }
  if (collection.is_private && collection.playlist_owner_id !== currentUserId) {
    yield* call(collectionDownloadFailed, {
      id: collectionId,
      message: `collection to download is private and user is not owner - ${collectionId} - ${currentUserId}`,
      error: DownloadCollectionError.IS_PRIVATE
    })
    return OfflineDownloadStatus.ERROR
  }

  try {
    yield* call(downloadCollectionCoverArt, collection)
    yield* call(
      writeCollectionJson,
      collectionId.toString(),
      collection,
      collection.user
    )
  } catch (e) {
    yield* call(collectionDownloadFailed, {
      id: collectionId,
      message: e?.message ?? 'Unknown Error',
      error: DownloadCollectionError.UNKNOWN
    })
    return OfflineDownloadStatus.ERROR
  }

  return OfflineDownloadStatus.SUCCESS
}

type CollectionDownloadFailedConfig = {
  id: ID
  message: string
  error: DownloadCollectionError
}

function* collectionDownloadFailed(config: CollectionDownloadFailedConfig) {
  const { id, message, error } = config
  yield* put(errorDownload({ type: 'collection', id }))

  if (
    error === DownloadCollectionError.IS_DELETED ||
    error === DownloadCollectionError.IS_PRIVATE
  ) {
    // todo remove and dont retry
  }

  // todo post error message?
  console.error(message)
}
