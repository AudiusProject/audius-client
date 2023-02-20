import {
  PlayableType,
  cacheCollectionsSelectors,
  tracksSelectors
} from '@audius/common'

import { AppState } from 'store/types'
const { getTrack } = tracksSelectors
const { getCollection } = cacheCollectionsSelectors

export const getIsOpen = (state: AppState) =>
  state.application.ui.embedModal.isOpen
export const getId = (state: AppState) => state.application.ui.embedModal.id
export const getKind = (state: AppState) => state.application.ui.embedModal.kind

export const getMetadata = (state: AppState) => {
  const id = getId(state)
  const kind = getKind(state)
  switch (kind) {
    case PlayableType.TRACK:
      return getTrack(state, { id })
    case PlayableType.ALBUM:
    case PlayableType.PLAYLIST:
      return getCollection(state, { id })
    default:
      // should never happen, but I guess ts doesn't like combined cases
      return null
  }
}
