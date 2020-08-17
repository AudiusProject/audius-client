import { AppState, Status } from 'store/types'
import { ExploreCollectionsVariant } from '../types'
import { getCollections as getCachedCollections } from 'store/cache/collections/selectors'
import Collection from 'models/Collection'
import { getUsers } from 'store/cache/users/selectors'

const getBaseState = (state: AppState) =>
  state.application.pages.exploreCollections

export const getStatus = (
  state: AppState,
  { variant }: { variant: ExploreCollectionsVariant }
) => {
  const baseState = getBaseState(state)[variant]
  return baseState ? baseState.status : Status.LOADING
}

export const getCollections = (
  state: AppState,
  { variant }: { variant: ExploreCollectionsVariant }
) => {
  const baseState = getBaseState(state)[variant]
  const collectionIds = baseState ? baseState.collectionIds : []
  const collections = getCachedCollections(state, { ids: collectionIds })

  const collectionsList = collectionIds.map(id => collections[id])

  const userIds = collectionsList.map((c: Collection) => c.playlist_owner_id)
  const users = getUsers(state, { ids: userIds })

  const userCollections = collectionsList.map((c: Collection) => ({
    ...c,
    user: users[c.playlist_owner_id]
  }))

  return userCollections
}
