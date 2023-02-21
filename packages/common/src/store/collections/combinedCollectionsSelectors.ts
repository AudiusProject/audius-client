import { Collection } from 'models/Collection'
import { ID, UID } from 'models/Identifiers'
import { User } from 'models/User'
import { CommonState } from 'store/commonStore'
import { getTracks } from 'store/tracks/tracksSelectors'
import { getUser, getUsers } from 'store/users/usersSelectors'
import { Uid } from 'utils/uid'

import { getCollection } from './collectionsSelectors'
import { EnhancedCollectionTrack } from './types'

const emptyList: EnhancedCollectionTrack[] = []
export const getTracksFromCollection = (
  state: CommonState,
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

  const ids = collection.playlist_contents.track_ids.map((t) => t.track)
  const tracks = getTracks(state, { ids })

  const userIds = Object.keys(tracks)
    .map((id) => {
      const track = tracks[id as unknown as number]
      if (track?.owner_id) {
        return track.owner_id
      }
      console.error(`Found empty track ${id}, expected it to have an owner_id`)
      return null
    })
    .filter((userId) => userId !== null) as number[]
  const users = getUsers(state, { ids: userIds })

  if (!users || Object.keys(users).length === 0) return emptyList

  // Return tracks & rebuild UIDs for the track so they refer directly to this collection
  return collection.playlist_contents.track_ids
    .map((t, i) => {
      const trackUid = Uid.fromString(t.uid ?? '')
      trackUid.source = `${collectionSource}:${trackUid.source}`
      trackUid.count = i

      const track = tracks[t.track]
      if (!track) {
        console.error(`Found empty track ${t.track}`)
        return null
      }
      return {
        ...track,
        uid: trackUid.toString(),
        user: users[track.owner_id]
      }
    })
    .filter(Boolean) as EnhancedCollectionTrack[]
}

type EnhancedCollection = Collection & { user: User }

export const getCollectionWithUser = (
  state: CommonState,
  props: { id?: ID }
): EnhancedCollection | null => {
  const collection = getCollection(state, { id: props.id })
  const userId = collection?.playlist_owner_id
  const user = getUser(state, { id: userId })
  if (collection && user) {
    return {
      user,
      ...collection
    }
  }
  return null
}
