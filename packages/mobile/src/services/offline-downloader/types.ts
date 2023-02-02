import type { DownloadReason } from '@audius/common'

import type { CollectionId } from 'app/store/offline-downloads/slice'

export type CollectionForDownload = {
  collectionId: CollectionId
  isFavoritesDownload?: boolean
}

export type TrackForDownload = {
  trackId: number
  downloadReason: DownloadReason
  // Timestamp associated with when this track was favorited if the reason
  // is favorites.
  favoriteCreatedAt?: string
}
