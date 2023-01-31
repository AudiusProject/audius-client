import { getCollections as getCachedCollections } from 'store/cache/collections/selectors'
import { getUsers } from 'store/cache/users/selectors'
import { CommonState } from 'store/commonStore'
import { removeNullable } from 'utils/typeUtils'

import { Status, UserCollection } from '../../../../models'
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

  const userIds = collectionsList
    .map((c) => c?.playlist_owner_id)
    .filter(removeNullable)
  const users = getUsers(state, { ids: userIds })

  const userCollections = collectionsList.map((c) => ({
    ...c,
    user: c ? users[c.playlist_owner_id] : null
  })) as UserCollection[]

  return userCollections.filter(
    (playlist) => playlist.user && !playlist.user.is_deactivated
  )
}
