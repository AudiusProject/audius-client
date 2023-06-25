import { Moment } from 'moment'

import {
  ID,
  UID,
  Collectible,
  LineupState,
  SmartCollectionVariant,
  Status,
  LineupTrack
} from 'models'

export type CollectionTrack = LineupTrack & { dateAdded: Moment } & {
  collectible?: Collectible
}

export type CollectionSuggestedTrack = LineupTrack

export type CollectionsPageState = {
  permalink: string
  collectionId: ID | null
  collectionUid: UID | null
  status: Status | null
  tracks: LineupState<CollectionTrack>
  suggestedTracks: LineupState<CollectionSuggestedTrack>
  userUid: UID | null
  smartCollectionVariant: SmartCollectionVariant
  savedTrackIds: ID[] | null
  prevSuggestedIds: ID[]
}

export type CollectionsPageType = 'playlist' | 'album'

export type CollectionPageTrackRecord = CollectionTrack & {
  key: string
  name: string
  artist: string
  handle: string
  date: Moment
  time: number
  plays: number | undefined
}
