import type {
  Collection,
  AccountCollection,
  UserCollectionMetadata
} from '@audius/common'
import {
  collectionPageActions,
  FavoriteSource,
  tracksSocialActions,
  collectionsSocialActions,
  accountSelectors,
  cacheCollectionsSelectors
} from '@audius/common'
import { waitForBackendSetup } from 'audius-client/src/common/store/backend/sagas'
import { waitForRead } from 'audius-client/src/utils/sagaHelpers'
import {
  takeLatest,
  call,
  select,
  take,
  takeEvery,
  put
} from 'typed-redux-saga'

import { apiClient } from 'app/services/audius-api-client'
import {
  purgeAllDownloads,
  batchDownloadTrack,
  downloadCollectionById,
  DOWNLOAD_REASON_FAVORITES,
  syncFavorites,
  syncFavoritedCollections,
  syncStaleTracks,
  syncCollectionsTracks
} from 'app/services/offline-downloader'

import { getOfflineCollections } from './selectors'
import { clearOfflineDownloads, doneLoadingFromDisk } from './slice'
const { fetchCollection, FETCH_COLLECTION_SUCCEEDED, FETCH_COLLECTION_FAILED } =
  collectionPageActions
const { getUserId } = accountSelectors
const { getCollections } = cacheCollectionsSelectors

export function* downloadSavedTrack(
  action: ReturnType<typeof tracksSocialActions.saveTrack>
) {
  const offlineCollections = yield* select(getOfflineCollections)
  if (!offlineCollections[DOWNLOAD_REASON_FAVORITES]) return
  batchDownloadTrack([
    {
      trackId: action.trackId,
      downloadReason: {
        is_from_favorites: true,
        collection_id: DOWNLOAD_REASON_FAVORITES
      }
    }
  ])
}

export function* watchSaveTrack() {
  yield* takeEvery(tracksSocialActions.SAVE_TRACK, downloadSavedTrack)
}

export function* downloadSavedCollection(
  action: ReturnType<typeof collectionsSocialActions.saveCollection>
) {
  const offlineCollections = yield* select(getOfflineCollections)
  const currentUserId = yield* select(getUserId)

  if (
    !offlineCollections[DOWNLOAD_REASON_FAVORITES] ||
    action.source === FavoriteSource.OFFLINE_DOWNLOAD ||
    !currentUserId
  )
    return
  const collection: UserCollectionMetadata = (yield* call(
    [apiClient, apiClient.getPlaylist],
    {
      playlistId: action.collectionId,
      currentUserId
    }
  ))?.[0]

  const tracksForDownload = collection.tracks?.map((track) => ({
    trackId: track.track_id,
    downloadReason: {
      is_from_favorites: false,
      collection_id: action.collectionId.toString()
    }
  }))
  if (!tracksForDownload) return
  downloadCollectionById(action.collectionId, false)
  batchDownloadTrack(tracksForDownload)
}

export function* watchSaveCollection() {
  yield* takeEvery(
    collectionsSocialActions.SAVE_COLLECTION,
    downloadSavedCollection
  )
}

function* clearOffineDownloadsAsync() {
  yield* call(purgeAllDownloads)
}

function* watchClearOfflineDownloads() {
  yield* takeLatest(clearOfflineDownloads, clearOffineDownloadsAsync)
}

export function* startSync() {
  try {
    console.log('SyncSaga - init')
    yield* take(doneLoadingFromDisk)
    yield* waitForRead()
    yield* waitForBackendSetup()
    const collections = yield* select(getCollections)
    // Don't use getAccountSelections as it filters out collections not in cache
    const accountCollections: { [id: number]: AccountCollection } =
      yield* select((state) => state.account.collections)
    const accountCollectionIds = Object.values(accountCollections).map(
      (collection) => collection.id
    )
    const offlineCollectionsState = yield* select(getOfflineCollections)
    if (offlineCollectionsState[DOWNLOAD_REASON_FAVORITES]) {
      yield* call(syncFavorites)
    }

    const offlineCollections: Collection[] = Object.entries(
      offlineCollectionsState
    )
      .filter(
        ([id, isDownloaded]) => isDownloaded && id !== DOWNLOAD_REASON_FAVORITES
      )
      .map(([id, isDownloaded]) => collections[id] ?? null)
      .filter((collection) => !!collection)

    const isFavoritesDownloadEnabled =
      offlineCollectionsState[DOWNLOAD_REASON_FAVORITES]

    for (const collectionId of accountCollectionIds) {
      yield* put(fetchCollection(collectionId))
      yield* take([FETCH_COLLECTION_SUCCEEDED, FETCH_COLLECTION_FAILED])
    }

    yield* call(
      syncFavoritedCollections,
      offlineCollections,
      accountCollectionIds
    )

    yield* call(
      syncCollectionsTracks,
      offlineCollections,
      isFavoritesDownloadEnabled
    )
    yield* call(syncStaleTracks)
  } catch (e) {
    console.error('SyncSaga - error', e.message, e.stack)
  }
}

const sagas = () => {
  return [
    watchSaveTrack,
    watchSaveCollection,
    watchClearOfflineDownloads,
    startSync
  ]
}

export default sagas
