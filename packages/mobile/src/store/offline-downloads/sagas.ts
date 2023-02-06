import type { Collection, AccountCollection } from '@audius/common'
import {
  waitForValue,
  collectionPageActions,
  tracksSocialActions,
  cacheCollectionsActions,
  cacheCollectionsSelectors,
  reachabilityActions,
  savedPageActions
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

import {
  purgeAllDownloads,
  batchDownloadTrack,
  DOWNLOAD_REASON_FAVORITES,
  syncFavoritedTracks,
  syncFavoritedCollections,
  syncStaleTracks,
  syncCollectionsTracks,
  enqueueTrackDownload,
  batchRemoveTrackDownload
} from 'app/services/offline-downloader'
import {
  blockedPlayCounterWorker,
  playCounterWorker,
  setPlayCounterWorker
} from 'app/services/offline-downloader/workers'

import { processDownloadQueueSaga } from './sagas/processDownloadQueueSaga/processDownloadQueueSaga'
import { watchRemoveCollectionDownloads } from './sagas/removeCollectionDownloadsSaga'
import { watchRemoveTrackDownloads } from './sagas/removeTrackDownloadsSaga'
import { requestDownloadAllFavoritesSaga } from './sagas/requestDownloadAllFavoritesSaga'
import { requestDownloadCollectionSaga } from './sagas/requestDownloadCollectionSaga'
import { requestDownloadFavoritedCollectionSaga } from './sagas/requestDownloadFavoritedCollectionSaga'
import { requestRemoveAllDownloadedFavoritesSaga } from './sagas/requestRemoveAllDownloadedFavoritesSaga'
import { requestRemoveDownloadedCollectionSaga } from './sagas/requestRemoveDownloadedCollectionSaga'
import { requestRemoveFavoritedDownloadedCollectionSaga } from './sagas/requestRemoveFavoritedDownloadedCollectionSaga'
import { watchUpdateTrackDownloadReasons } from './sagas/updateTrackDownloadReasonsSaga'
import { watchAddOfflineItems } from './sagas/watchAddOfflineItems'
import { watchReachability } from './sagas/watchReachability'
import { watchRemoveOfflineItems } from './sagas/watchRemoveOfflineItems'
import { watchSaveCollectionSaga } from './sagas/watchSaveCollectionSaga'
import {
  getIsCollectionMarkedForDownload,
  getIsDoneLoadingFromDisk,
  getOfflineCollections,
  getOfflineFavoritedCollections
} from './selectors'
import {
  clearOfflineDownloads,
  doneLoadingFromDisk,
  OfflineDownloadStatus,
  startTrackDownload
} from './slice'
const { fetchCollection, FETCH_COLLECTION_SUCCEEDED, FETCH_COLLECTION_FAILED } =
  collectionPageActions
const { SET_REACHABLE, SET_UNREACHABLE } = reachabilityActions
const { getCollections } = cacheCollectionsSelectors

export function* downloadSavedTrack(
  action: ReturnType<typeof tracksSocialActions.saveTrack>
) {
  const offlineCollections = yield* select(getOfflineCollections)
  if (!offlineCollections[DOWNLOAD_REASON_FAVORITES]) return
  enqueueTrackDownload({
    trackId: action.trackId,
    downloadReason: {
      is_from_favorites: true,
      collection_id: DOWNLOAD_REASON_FAVORITES
    }
  })
}

export function* watchSaveTrack() {
  yield* takeEvery(tracksSocialActions.SAVE_TRACK, downloadSavedTrack)
}

type UnsaveTrackAction = ReturnType<typeof tracksSocialActions.unsaveTrack>

function* watchUnsaveTrack() {
  yield* takeEvery(
    tracksSocialActions.UNSAVE_TRACK,
    function* removeTrack(action: UnsaveTrackAction) {
      const { trackId } = action
      const trackToRemove = {
        trackId,
        downloadReason: {
          is_from_favorites: true,
          collection_id: DOWNLOAD_REASON_FAVORITES
        }
      }

      yield* call(batchRemoveTrackDownload, [trackToRemove])
    }
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
    const isFavoritesDownloadEnabled =
      offlineCollectionsState[DOWNLOAD_REASON_FAVORITES]
    const offlineFavoritedCollections = yield* select(
      getOfflineFavoritedCollections
    )
    const existingOfflineCollections: Collection[] = Object.entries(
      offlineFavoritedCollections
    )
      .filter(
        ([id, isDownloaded]) => isDownloaded && id !== DOWNLOAD_REASON_FAVORITES
      )
      .map(([id, isDownloaded]) => collections[id] ?? null)
      .filter((collection) => !!collection)

    if (isFavoritesDownloadEnabled) {
      // Individual tracks
      yield* call(syncFavoritedTracks)

      // Favorited collections
      for (const collectionId of accountCollectionIds) {
        yield* put(fetchCollection(collectionId))
        yield* take([FETCH_COLLECTION_SUCCEEDED, FETCH_COLLECTION_FAILED])
      }

      const updatedCollections = yield* select(getCollections)
      const updatedAccountCollections = accountCollectionIds
        .map((id) => updatedCollections[id])
        .filter((collection) => !!collection)

      yield* call(
        syncFavoritedCollections,
        existingOfflineCollections,
        updatedAccountCollections
      )
    }

    // Individual collections
    yield* call(
      syncCollectionsTracks,
      existingOfflineCollections,
      isFavoritesDownloadEnabled !== OfflineDownloadStatus.INACTIVE &&
        isFavoritesDownloadEnabled !== OfflineDownloadStatus.ERROR &&
        isFavoritesDownloadEnabled !== OfflineDownloadStatus.ABANDONED
    )
    yield* call(syncStaleTracks)
  } catch (e) {
    console.error('SyncSaga - error', e.message, e.stack)
  }
}

export function* handleSetReachable() {
  yield* call(setPlayCounterWorker, playCounterWorker)
}

export function* watchSetReachable() {
  yield* takeLatest(SET_REACHABLE, handleSetReachable)
}

export function* handleSetUnreachable() {
  yield* call(setPlayCounterWorker, blockedPlayCounterWorker)
}

export function* watchSetUnreachable() {
  yield* takeLatest(SET_UNREACHABLE, handleSetUnreachable)
}

function* downloadNewPlaylistTrackIfNecessary({
  trackId,
  playlistId
}: ReturnType<typeof cacheCollectionsActions.addTrackToPlaylist>) {
  yield* call(waitForValue, getIsDoneLoadingFromDisk)
  const isCollectionDownloaded = yield* select(
    getIsCollectionMarkedForDownload(playlistId.toString())
  )
  if (!isCollectionDownloaded || !trackId) return

  const favoriteDownloadedCollections = yield* select(
    getOfflineFavoritedCollections
  )
  const trackForDownload = {
    trackId,
    downloadReason: {
      collection_id: playlistId.toString(),
      is_from_favorites: !!favoriteDownloadedCollections[playlistId]
    }
  }
  yield* put(startTrackDownload(trackId.toString()))
  yield* call(enqueueTrackDownload, trackForDownload)
}

function* watchAddTrackToPlaylist() {
  yield takeEvery(
    cacheCollectionsActions.ADD_TRACK_TO_PLAYLIST,
    downloadNewPlaylistTrackIfNecessary
  )
}

function* downloadNewFavoriteIfNecessary({
  trackId
}: ReturnType<typeof savedPageActions.addLocalSave>) {
  yield* call(waitForValue, getIsDoneLoadingFromDisk)
  const areFavoritesDownloaded = yield* select(
    getIsCollectionMarkedForDownload(DOWNLOAD_REASON_FAVORITES)
  )
  if (!areFavoritesDownloaded) return

  batchDownloadTrack([
    {
      trackId,
      downloadReason: {
        is_from_favorites: true,
        collection_id: DOWNLOAD_REASON_FAVORITES
      }
    }
  ])
}

function* watchAddLocalSave() {
  yield* takeEvery(
    savedPageActions.ADD_LOCAL_SAVE,
    downloadNewFavoriteIfNecessary
  )
}

const sagas = () => {
  return [
    watchSaveTrack,
    watchUnsaveTrack,
    watchSaveCollectionSaga,
    watchClearOfflineDownloads,
    watchSetReachable,
    watchSetUnreachable,
    watchAddOfflineItems,
    watchRemoveOfflineItems,
    startSync,
    watchAddTrackToPlaylist,
    watchAddLocalSave,
    watchRemoveTrackDownloads,
    watchUpdateTrackDownloadReasons,
    watchRemoveCollectionDownloads,
    watchReachability,
    requestDownloadAllFavoritesSaga,
    requestDownloadCollectionSaga,
    requestDownloadFavoritedCollectionSaga,
    requestRemoveAllDownloadedFavoritesSaga,
    requestRemoveDownloadedCollectionSaga,
    requestRemoveFavoritedDownloadedCollectionSaga,
    processDownloadQueueSaga
  ]
}

export default sagas
