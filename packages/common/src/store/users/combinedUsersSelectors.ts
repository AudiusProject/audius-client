// Combined users selectors, ideally should be moved elsewhere

import { ID, UID } from 'models/Identifiers'
import { getCollection } from 'store/cache/collections/selectors'
import { CommonState } from 'store/commonStore'
import { getTrack } from 'store/tracks/tracksSelectors'

import { getUser } from './usersSelectors'

export const getUserFromTrack = (
  state: CommonState,
  props: { id?: ID | null; uid?: UID | null }
) => {
  const track = getTrack(state, props)
  if (track && track.owner_id) return getUser(state, { id: track.owner_id })
  return null
}

export const getUserFromCollection = (
  state: CommonState,
  props: { id?: ID | null; uid?: UID | null }
) => {
  const collection = getCollection(state, props)
  if (collection && collection.playlist_owner_id)
    return getUser(state, { id: collection.playlist_owner_id })
  return null
}
