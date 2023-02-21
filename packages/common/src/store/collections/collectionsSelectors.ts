import { zipObject } from 'lodash'

import { Collection } from 'models/Collection'
import { ID, UID } from 'models/Identifiers'
import { CommonState } from 'store/commonStore'

import { collectionsAdapter } from './collectionsSlice'

export const {
  selectById: selectCollectionById,
  selectIds: selectCollectionIds,
  selectEntities: selectCollectionEntities,
  selectAll: selectAllCollection,
  selectTotal: selectTotaCollectionl
} = collectionsAdapter.getSelectors<CommonState>((state) => state.collections)

export const getCollection = (
  state: CommonState,
  props: { id?: ID | null; uid?: UID | null; permalink?: string | null }
) => {
  if (props?.permalink) {
    const collectionId =
      state.collections.permalinks[props.permalink.toLowerCase()]
    if (collectionId) {
      return selectCollectionById(state, collectionId) ?? null
    }
  }
  if (props?.id) {
    return selectCollectionById(state, props.id) ?? null
  }

  if (props?.uid) {
    const collectionId = state.collections.uids[props.uid]
    if (collectionId) {
      return selectCollectionById(state, collectionId) ?? null
    }
  }

  return null
}

export const getCollections = (
  state: CommonState,
  props?: {
    ids?: ID[] | null
    uids?: UID[] | null
    permalinks?: string[] | null
  }
) => {
  if (props && props.ids) {
    const collections: { [id: number]: Collection } = {}
    props.ids.forEach((id) => {
      const collection = getCollection(state, { id })
      if (collection) {
        collections[id] = collection
      }
    })
    return collections
  } else if (props && props.uids) {
    const collections: { [uid: string]: Collection } = {}
    props.uids.forEach((uid) => {
      const collection = getCollection(state, { uid })
      if (collection) {
        collections[collection.playlist_id] = collection
      }
    })
    return collections
  } else if (props && props.permalinks) {
    const collections: { [permalink: string]: Collection } = {}
    props.permalinks.forEach((permalink) => {
      const collection = getCollection(state, { permalink })
      if (collection) collections[permalink] = collection
    })
    return collections
  }
  return selectCollectionEntities(state) ?? ({} as { [id: number]: Collection })
}

export const getCollectionsByUid = (state: CommonState) => {
  return Object.keys(state.collections.uids).reduce((entries, uid) => {
    entries[uid] = getCollection(state, { uid })
    return entries
  }, {} as { [uid: string]: Collection | null })
}

export const getCollectionTimestamps = (state: CommonState, ids: ID[]) => {
  return zipObject(
    ids,
    ids.map((id) => state.collections.timestamps[id] ?? null)
  )
}
