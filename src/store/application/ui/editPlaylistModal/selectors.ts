import { AppState } from 'store/types'
import { getCollection as getCollectionById } from 'store/cache/collections/selectors'
import { getUser as getUserById } from 'store/cache/users/selectors'

const getBase = (state: AppState) => state.application.ui.editPlaylistModal
export const getIsOpen = (state: AppState) => {
  return getBase(state).isOpen
}

export const getCollectionId = (state: AppState) => {
  return getBase(state).collectionId
}

export const getCollectionAndUser = (state: AppState) => {
  const collectionId = getBase(state).collectionId
  const collection = getCollectionById(state, { id: collectionId })
  const userId = collection?.playlist_owner_id
  const user = getUserById(state, { id: userId })
  return { collection, user }
}
