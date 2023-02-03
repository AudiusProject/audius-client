import type { ID } from '@audius/common'
import { takeEvery, select, put, call } from 'typed-redux-saga'

import type { TrackForDownload } from 'app/services/offline-downloader'
import {
  cancelQueuedCollectionDownloads,
  cancelQueuedTrackDownloads
} from 'app/services/offline-downloader'

import { getOfflineTracks } from '../selectors'
import type {
  RequestRemoveFavoritedDownloadedCollectionAction,
  TrackReasonsToUpdate
} from '../slice'
import {
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

function* removeFavoritedDownloadedCollection(
  action: RequestRemoveFavoritedDownloadedCollectionAction
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
      const { collection_id } = reason
      // remove both cases where is_from_favorites = true and is_from_favorites = false
      return !(collection_id && collection_id === collectionIdString)
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

    tracksToDequeue.push({
      trackId: track_id,
      downloadReason: {
        is_from_favorites: true,
        collection_id: collectionIdString
      }
    })
  }

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
