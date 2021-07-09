import { createCustomAction } from 'typesafe-actions'

import { ID, CID } from 'models/common/Identifiers'

export const OPEN = 'SHARE_SOUND_TO_TIKTOK_MODAL/OPEN'
export const CLOSE = 'SHARE_SOUND_TO_TIKTOK_MODAL/CLOSE'
export const SHARE = 'SHARE_SOUND_TO_TIKTOK_MODAL/SHARE'

export const open = createCustomAction(
  OPEN,
  (trackId: ID, trackTitle: string, trackCid: string) => ({
    trackId,
    trackTitle,
    trackCid
  })
)
export const close = createCustomAction(CLOSE, () => {})
export const share = createCustomAction(SHARE, (trackId: ID, cid: CID) => ({
  trackId,
  cid
}))
