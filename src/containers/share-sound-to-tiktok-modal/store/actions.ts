import { createCustomAction } from 'typesafe-actions'

import { ID } from 'models/common/Identifiers'

export const OPEN = 'SHARE_SOUND_TO_TIKTOK_MODAL/OPEN'
export const CLOSE = 'SHARE_SOUND_TO_TIKTOK_MODAL/CLOSE'

export const open = createCustomAction(
  OPEN,
  (trackId: ID, trackTitle: string) => ({ trackId, trackTitle })
)
export const close = createCustomAction(CLOSE, () => {})
