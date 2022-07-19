import { Collection, Status } from '@audius/common'

import { CommonState } from 'common/store'
import { getCollections as getCachedCollections } from 'common/store/cache/collections/selectors'
import { getUsers } from 'common/store/cache/users/selectors'

import { ExploreCollectionsVariant } from '../types'

const getBaseState = (state: CommonState) => state.pages.exploreCollections

export const getStatus = (
  state: CommonState,
  { variant }: { variant: ExploreCollectionsVariant }
) => {
  const baseState = getBaseState(state)[variant]
  return baseState ? baseState.status : Status.LOADING
}

export const getCollections = (
  state: CommonState,
  { variant }: { variant: ExploreCollectionsVariant }
) => {
  const baseState = getBaseState(state)[variant]
  const collectionIds = baseState ? baseState.collectionIds : []
  const collections = getCachedCollections(state, { ids: collectionIds })

  const collectionsList = collectionIds.map((id) => collections[id])

  const userIds = collectionsList.map((c: Collection) => c.playlist_owner_id)
  const users = getUsers(state, { ids: userIds })

  const userCollections = collectionsList.map((c: Collection) => ({
    ...c,
    user: users[c.playlist_owner_id]
  }))

  return userCollections.filter((playlist) => !playlist.user.is_deactivated)
}
