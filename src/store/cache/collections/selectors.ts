import { getEntry, getAllEntries } from 'store/cache/selectors'
import { Kind, AppState, Status } from 'store/types'
import { getTracks } from 'store/cache/tracks/selectors'
import { getUsers, getUser as getUserById } from 'store/cache/users/selectors'
import { Uid } from 'utils/uid'
import { ID, UID } from 'models/common/Identifiers'
import Collection from 'models/Collection'
import Track from 'models/Track'
import User from 'models/User'

export const getCollection = (
  state: AppState,
  props: { id?: ID | null; uid?: UID | null }
) => {
  return getEntry(state, {
    ...props,
    kind: Kind.COLLECTIONS
  })
}
export const getStatus = (state: AppState, props: { id: ID }) =>
  state.collections.statuses[props.id] || null

export const getCollections = (
  state: AppState,
  props?: { ids?: ID[] | null; uids?: UID[] | null }
) => {
  if (props && props.ids) {
    const collections: { [id: number]: Collection } = {}
    props.ids.forEach(id => {
      const collection = getCollection(state, { id })
      if (collection) {
        collections[id] = collection
      }
    })
    return collections
  } else if (props && props.uids) {
    const collections: { [uid: string]: Collection } = {}
    props.uids.forEach(uid => {
      const collection = getCollection(state, { uid })
      if (collection) {
        collections[collection.playlist_id] = collection
      }
    })
    return collections
  }
  return getAllEntries(state, { kind: Kind.COLLECTIONS })
}

export const getCollectionsByUid = (state: AppState) => {
  return Object.keys(state.collections.uids).reduce((entries, uid) => {
    entries[uid] = getCollection(state, { uid })
    return entries
  }, {} as { [uid: string]: Collection | null })
}

export const getStatuses = (state: AppState, props: { ids: ID[] }) => {
  const statuses: { [id: number]: Status } = {}
  props.ids.forEach(id => {
    const status = getStatus(state, { id })
    if (status) {
      statuses[id] = status
    }
  })
  return statuses
}

type EnhancedCollectionTrack = Track & { user: User; uid: UID }
const emptyList: EnhancedCollectionTrack[] = []
export const getTracksFromCollection = (
  state: AppState,
  props: { uid: UID }
) => {
  const collection = getCollection(state, props)

  if (
    !collection ||
    !collection.playlist_contents ||
    !collection.playlist_contents.track_ids
  )
    return emptyList

  const collectionSource = Uid.fromString(props.uid).source

  const ids = collection.playlist_contents.track_ids.map(t => t.track)
  const tracks = getTracks(state, { ids })

  const userIds = Object.keys(tracks).map(
    id => tracks[(id as unknown) as number].owner_id
  )
  const users = getUsers(state, { ids: userIds })

  if (!users) return emptyList

  // Return tracks & rebuild UIDs for the track so they refer directly to this collection
  return collection.playlist_contents.track_ids.map((t, i) => {
    const trackUid = Uid.fromString(t.uid)
    trackUid.source = `${collectionSource}:${trackUid.source}`
    trackUid.count = i

    return {
      ...tracks[t.track],
      uid: trackUid.toString(),
      user: users[tracks[t.track].owner_id]
    }
  })
}

type EnhancedCollection = Collection & { user: User }
export const getCollectionWithUser = (
  state: AppState,
  props: { id?: ID }
): EnhancedCollection | null => {
  const collection = getCollection(state, { id: props.id })
  const userId = collection?.playlist_owner_id
  const user = getUserById(state, { id: userId })
  if (collection && user) {
    return {
      user,
      ...collection
    }
  }
  return null
}
