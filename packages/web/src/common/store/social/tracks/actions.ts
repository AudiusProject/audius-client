import {
  ID,
  CID,
  RepostSource,
  FavoriteSource,
  ShareSource
} from '@audius/common'
import { createCustomAction } from 'typesafe-actions'

export const REPOST_TRACK = 'SOCIAL/REPOST_TRACK'
export const UNDO_REPOST_TRACK = 'SOCIAL/UNDO_REPOST_TRACK'
export const REPOST_FAILED = 'SOCIAL/TRACK_REPOST_FAILED'

export const SAVE_TRACK = 'SOCIAL/SAVE_TRACK'
export const SAVE_TRACK_SUCCEEDED = 'SOCIAL/SAVE_TRACK_SUCCEEDED'
export const SAVE_TRACK_FAILED = 'SOCIAL/SAVE_TRACK_FAILED'

export const UNSAVE_TRACK = 'SOCIAL/UNSAVE_TRACK'
export const UNSAVE_TRACK_SUCCEEDED = 'SOCIAL/UNSAVE_TRACK_SUCCEEDED'
export const UNSAVE_TRACK_FAILED = 'SOCIAL/UNSAVE_TRACK_FAILED'

export const SET_ARTIST_PICK = 'SOCIAL/SET_ARTIST_PICK'
export const UNSET_ARTIST_PICK = 'SOCIAL/UNSET_ARTIST_PICK'

export const RECORD_LISTEN = 'SOCIAL/RECORD_LISTEN'
export const DOWNLOAD_TRACK = 'SOCIAL/DOWNLOAD_TRACK'

export const SHARE_TRACK = 'SOCIAL/SHARE_TRACK'

export const repostTrack = createCustomAction(
  REPOST_TRACK,
  (trackId: ID, source: RepostSource) => ({ trackId, source })
)

export const undoRepostTrack = createCustomAction(
  UNDO_REPOST_TRACK,
  (trackId: ID, source: RepostSource) => ({ trackId, source })
)

export const trackRepostFailed = createCustomAction(
  REPOST_FAILED,
  (trackId: ID, error: any) => ({ trackId, error })
)

export const saveTrack = createCustomAction(
  SAVE_TRACK,
  (trackId: ID, source: FavoriteSource) => ({ trackId, source })
)

export const saveTrackSucceeded = createCustomAction(
  SAVE_TRACK_SUCCEEDED,
  (trackId: ID) => ({ trackId })
)

export const saveTrackFailed = createCustomAction(
  SAVE_TRACK_FAILED,
  (trackId: ID, error: any) => ({ trackId, error })
)

export const unsaveTrack = createCustomAction(
  UNSAVE_TRACK,
  (trackId: ID, source: FavoriteSource) => ({ trackId, source })
)

export const unsaveTrackSucceeded = createCustomAction(
  UNSAVE_TRACK_SUCCEEDED,
  (trackId: ID) => ({ trackId })
)

export const unsaveTrackFailed = createCustomAction(
  UNSAVE_TRACK_FAILED,
  (trackId: ID, error: any) => ({ trackId, error })
)

export const setArtistPick = createCustomAction(
  SET_ARTIST_PICK,
  (trackId: ID) => ({ trackId })
)

export const unsetArtistPick = createCustomAction(UNSET_ARTIST_PICK, () => {
  console.log('artist pick ')
})

export const recordListen = createCustomAction(
  RECORD_LISTEN,
  (trackId: ID) => ({ trackId })
)

export const downloadTrack = createCustomAction(
  DOWNLOAD_TRACK,
  (trackId: ID, cid: CID, creatorNodeEndpoints: string, stemName?: string) => ({
    trackId,
    cid,
    creatorNodeEndpoints,
    stemName
  })
)

export const shareTrack = createCustomAction(
  SHARE_TRACK,
  (trackId: ID, source: ShareSource) => ({ trackId, source })
)
