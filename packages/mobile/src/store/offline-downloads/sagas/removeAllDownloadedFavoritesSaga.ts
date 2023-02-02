import type { ID } from '@audius/common'
import { takeEvery, select, put } from 'typed-redux-saga'

import {
  getOfflineCollections,
  getOfflineFavoritedCollections,
  getOfflineTracks
} from '../selectors'
import type {
  CollectionId,
  CollectionReasonsToUpdate,
  TrackReasonsToUpdate
} from '../slice'
import {
  OfflineDownloadStatus,
  updateCollectionDownloadReasons,
  removeCollectionDownloads,
  updateTrackDownloadReasons,
  removeTrackDownloads,
  removeAllDownloadedFavorites
} from '../slice'

/*
 * Saga initiated when user has requested to un-download their favorites.
 * This includes the "favorites" collection and all collections that were
 * not explicitly downloaded by the user previously.
 */
export function* watchRemoveAllDownloadedFavorites() {
  yield* takeEvery(
    removeAllDownloadedFavorites.type,
    removeAllDownloadedFavoritesWorker
  )
}

function* removeAllDownloadedFavoritesWorker() {
  yield* removeAllFavoritesTracks()
  yield* removeAllFavoritesCollections()
}

function* removeAllFavoritesTracks() {
  const offlineTracks = yield* select(getOfflineTracks)
  const offlineTrackList = Object.keys(offlineTracks).map(
    (offlineTrackId) => offlineTracks[offlineTrackId]
  )

  const tracksToRemove: ID[] = []
  const reasonsToUpdate: TrackReasonsToUpdate[] = []

  // TODO: double check if "favorites" collection is in here
  const offlineFavoritedCollections = yield* select(
    getOfflineFavoritedCollections
  )
  const favoritedCollectionIds = new Set([
    'favorites',
    ...Object.keys(offlineFavoritedCollections)
  ])

  offlineTrackList.forEach((offlineTrack) => {
    const { track_id, offline } = offlineTrack
    if (!offline) return

    const { reasons_for_download } = offline

    const remainingReasons = reasons_for_download.filter((reason) => {
      const { is_from_favorites, collection_id } = reason
      return !(
        is_from_favorites &&
        collection_id &&
        favoritedCollectionIds.has(collection_id)
      )
    })

    if (remainingReasons.length === 0) {
      tracksToRemove.push(track_id)
    } else {
      reasonsToUpdate.push({
        trackId: track_id,
        reasons_for_download: remainingReasons
      })
    }
  })

  if (tracksToRemove.length > 0) {
    yield* put(removeTrackDownloads({ trackIds: tracksToRemove }))
  }

  if (reasonsToUpdate.length > 0) {
    yield* put(updateTrackDownloadReasons({ reasons: reasonsToUpdate }))
  }
}

function* removeAllFavoritesCollections() {
  const offlineCollections = yield* select(getOfflineCollections)
  const offlineFavoritedCollections = yield* select(
    getOfflineFavoritedCollections
  )

  const collectionsToRemove: CollectionId[] = ['favorites']
  const collectionsToUpdate: CollectionReasonsToUpdate[] = []

  Object.keys(offlineFavoritedCollections).forEach((favoritedCollectionId) => {
    const offlineCollectionStatus = offlineCollections[favoritedCollectionId]
    const isAlsoOfflineCollection =
      offlineCollectionStatus &&
      offlineCollectionStatus !== OfflineDownloadStatus.INIT

    if (isAlsoOfflineCollection) {
      collectionsToUpdate.push({
        collectionId: parseInt(favoritedCollectionId, 10),
        isFavoritesDownload: false
      })
    } else {
      collectionsToRemove.push(parseInt(favoritedCollectionId, 10))
    }
  })

  if (collectionsToRemove.length > 0) {
    yield* put(
      removeCollectionDownloads({ collectionIds: collectionsToRemove })
    )
  }
  if (collectionsToUpdate.length > 0) {
    yield* put(
      updateCollectionDownloadReasons({ reasons: collectionsToUpdate })
    )
  }
}
