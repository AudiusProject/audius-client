import { tracksSocialActions } from '@audius/common'
import { select, takeEvery } from 'typed-redux-saga'

import {
  batchDownloadTrack,
  DOWNLOAD_REASON_FAVORITES
} from 'app/services/offline-downloader'

import { getOfflineCollections } from './selectors'

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

const sagas = () => {
  return [watchSaveTrack]
}

export default sagas
