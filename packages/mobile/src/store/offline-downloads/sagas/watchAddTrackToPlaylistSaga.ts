import { collectionsActions } from '@audius/common'
import { put, select, takeEvery } from 'typed-redux-saga'

import { getCollectionDownloadStatus } from 'app/components/offline-downloads/CollectionDownloadStatusIndicator'

import { getOfflineCollectionMetadata } from '../selectors'
import { addOfflineEntries } from '../slice'

export function* watchAddTrackToPlaylistSaga() {
  yield takeEvery(
    collectionsActions.ADD_TRACK_TO_PLAYLIST,
    addOfflinePlaylistTrackIfNecessary
  )
}

function* addOfflinePlaylistTrackIfNecessary(
  action: ReturnType<typeof collectionsActions.addTrackToPlaylist>
) {
  const { trackId, playlistId } = action
  const collectionId =
    typeof playlistId === 'string' ? parseInt(playlistId, 10) : playlistId

  const isCollectionDownloaded = yield* select(
    getCollectionDownloadStatus,
    collectionId
  )

  if (!isCollectionDownloaded || !trackId) return

  const offlineCollectionMetadata = yield* select(getOfflineCollectionMetadata)
  const collectionMetadata = offlineCollectionMetadata[collectionId]
  if (!collectionMetadata) return

  const trackReasonsForDownload = collectionMetadata.reasons_for_download.map(
    (reason) => ({ ...reason, collection_id: collectionId })
  )

  yield* put(
    addOfflineEntries({
      items: [
        {
          type: 'track',
          id: trackId,
          metadata: {
            reasons_for_download: trackReasonsForDownload
          }
        }
      ]
    })
  )
}
