import { accountSelectors } from '@audius/common'
import { takeEvery, select, call, put } from 'typed-redux-saga'

import { fetchAllFavoritedTracks } from 'app/hooks/useFetchAllFavoritedTracks'
import { getAccountCollections } from 'app/screens/favorites-screen/selectors'
import { DOWNLOAD_REASON_FAVORITES } from 'app/services/offline-downloader'

import type { AddOfflineItemsAction } from '../slice'
import { addOfflineItems, requestDownloadAllFavorites } from '../slice'

const { getUserId } = accountSelectors

export function* requestDownloadAllFavoritesSaga() {
  yield* takeEvery(requestDownloadAllFavorites.type, downloadAllFavorites)
}

function* downloadAllFavorites() {
  const currentUserId = yield* select(getUserId)
  if (!currentUserId) return

  const offlineItemsToAdd: AddOfflineItemsAction['payload']['items'] = []

  offlineItemsToAdd.push({
    type: 'collection',
    id: DOWNLOAD_REASON_FAVORITES,
    metadata: { reasons_for_download: [{ is_from_favorites: true }] }
  })

  const allFavoritedTracks = yield* call(fetchAllFavoritedTracks, currentUserId)

  for (const favoritedTrack of allFavoritedTracks) {
    const { trackId, favoriteCreatedAt } = favoritedTrack
    const downloadReason = {
      is_from_favorites: true,
      collection_id: DOWNLOAD_REASON_FAVORITES
    }

    offlineItemsToAdd.push({
      type: 'track',
      id: trackId,
      metadata: {
        favorite_created_at: favoriteCreatedAt,
        reasons_for_download: [downloadReason]
      }
    })
  }

  const favoritedCollections = yield* select(getAccountCollections)

  for (const favoritedCollection of favoritedCollections) {
    const { playlist_id } = favoritedCollection
    const downloadReason = { is_from_favorites: true }

    offlineItemsToAdd.push({
      type: 'collection',
      id: playlist_id,
      metadata: {
        isFavoritesDownload: true,
        reasons_for_download: [downloadReason]
      }
    })
  }

  for (const favoritedCollection of favoritedCollections) {
    const {
      playlist_id,
      playlist_contents: { track_ids }
    } = favoritedCollection

    for (const { track: trackId } of track_ids) {
      const downloadReason = {
        is_from_favorites: true,
        collection_id: playlist_id
      }

      offlineItemsToAdd.push({
        type: 'track',
        id: trackId,
        metadata: { reasons_for_download: [downloadReason] }
      })
    }
  }

  yield* put(addOfflineItems({ items: offlineItemsToAdd }))
}

// function* downloadAllFavoritesLegacy() {
//   const currentUserId = yield* select(getUserId)
//   if (!currentUserId) return

//   const allFavoritedTracks = yield* call(fetchAllFavoritedTracks, currentUserId)

//   const offlineTrackMetadata = yield* select(getOfflineTrackMetadata)
//   const offlineQueueItems: DownloadQueueItem[] = []

//   for (const favoritedTrack of allFavoritedTracks) {
//     const { trackId, favoriteCreatedAt } = favoritedTrack
//     const downloadReason = {
//       is_from_favorites: true,
//       collection_id: DOWNLOAD_REASON_FAVORITES
//     }
//     addOfflineTrack(offlineTrackMetadata, trackId, downloadReason)
//     offlineQueueItems.push({ trackId, favoriteCreatedAt, downloadReason })
//   }

//   const favoritedCollections = yield* select(getAccountCollections)

//   const offlineCollectionMetadata = yield* select(getOfflineCollectionMetadata)

//   for (const favoritedCollection of favoritedCollections) {
//     const { playlist_id, playlist_contents } = favoritedCollection
//     const downloadReason = { is_from_favorites: true }

//     addOfflineCollection(offlineCollectionMetadata, playlist_id, downloadReason)
//     offlineQueueItems.push({
//       collectionId: playlist_id,
//       downloadReason
//     })

//     const { track_ids } = playlist_contents

//     for (const { track: trackId } of track_ids) {
//       const downloadReason = {
//         is_from_favorites: true,
//         collection_id: playlist_id
//       }
//       addOfflineTrack(offlineTrackMetadata, trackId, downloadReason)
//       offlineQueueItems.push({ trackId, downloadReason })
//     }
//   }
// }
