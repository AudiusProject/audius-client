import { Track, UID, User, Collection, Cache } from '../../../models'

export enum PlaylistOperations {
  ADD_TRACK = 'ADD_TRACK',
  REMOVE_TRACK = 'REMOVE_TRACK',
  REORDER = 'REORDER'
}

export type EnhancedCollectionTrack = Track & { user: User; uid: UID }

export interface CollectionsCacheState extends Cache<Collection> {
  permalinks: { [permalink: string]: { id: number } }
}
