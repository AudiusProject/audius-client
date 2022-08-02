import { ID, PlayableType } from '@audius/common'
import { createCustomAction } from 'typesafe-actions'

export const OPEN = 'EMBED_MODAL/OPEN'
export const CLOSE = 'EMBED_MODAL/CLOSE'

export const open = createCustomAction(OPEN, (id: ID, kind: PlayableType) => ({
  id,
  kind
}))
export const close = createCustomAction(CLOSE, () => ({}))
