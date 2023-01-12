import type {
  Collection,
  CommonState,
  UserCollectionMetadata
} from '@audius/common'
import {
  FavoriteSource,
  tracksSocialActions,
  collectionsSocialActions,
  accountSelectors,
  cacheCollectionsSelectors
} from '@audius/common'
import { waitForBackendSetup } from 'audius-client/src/common/store/backend/sagas'
import { waitForRead } from 'audius-client/src/utils/sagaHelpers'
import { takeLatest, call, select, take, takeEvery } from 'typed-redux-saga'

import { apiClient } from 'app/services/audius-api-client'
import {
  purgeAllDownloads,
  batchDownloadTrack,
  downloadCollectionById,
  DOWNLOAD_REASON_FAVORITES,
  syncFavorites,
  syncFavoritedCollections,
  syncStaleTracks,
  syncCollectionTracks as syncCollectionsTracks
} from 'app/services/offline-downloader'

import { getOfflineCollections } from './selectors'
import { clearOfflineDownloads, doneLoadingFromDisk } from './slice'
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
    console.log('SyncSaga - got read')
    const collections = yield* select(getCollections)
    // Don't use getAccountSelections as it filters out collections not in cache
    const accountCollections: CommonState['account']['collections'] =
      yield* select((state) => state.account.collections)
    console.log('SyncSaga - 1')
    const accountCollectionIds = Object.values(accountCollections).map(
      (collection) => collection.id
    )
    console.log('SyncSaga - 2')
    const offlineCollectionsState = yield* select(getOfflineCollections)
    console.log('SyncSaga - 3')
    if (offlineCollectionsState[DOWNLOAD_REASON_FAVORITES]) {
      console.log('SyncSaga - called syncFavorites')
      yield* call(syncFavorites)
    }
    console.log('SyncSaga - 4')

    const offlineCollections: Collection[] = Object.entries(
      offlineCollectionsState
    )
      .filter(
        ([id, isDownloaded]) => isDownloaded && id !== DOWNLOAD_REASON_FAVORITES
      )
      .map(([id, isDownloaded]) => collections[id] ?? null)
      .filter((collection) => !!collection)
    console.log('SyncSaga - 5')

    const isFavoritesDownloadEnabled =
      offlineCollectionsState[DOWNLOAD_REASON_FAVORITES]

    console.log(
      'SyncSaga - called syncFavoritedCollections',
      offlineCollections,
      accountCollectionIds
    )
    yield* call(
      syncFavoritedCollections,
      offlineCollections,
      accountCollectionIds
    )
    console.log(
      'SyncSaga - called syncCollectionsTracks',
      offlineCollections,
      isFavoritesDownloadEnabled
    )
    yield* call(
      syncCollectionsTracks,
      offlineCollections,
      isFavoritesDownloadEnabled
    )
    console.log('SyncSaga - called syncStaleTracks')
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
