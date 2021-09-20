import { Moment } from 'moment'

import { ID, UID } from 'common/models/Identifiers'
import Status from 'common/models/Status'
import { LineupTrack } from 'common/models/Track'
import { SmartCollectionVariant } from 'common/models/types'
import { LineupState } from 'models/common/Lineup'

type CollectionsPageState = {
  collectionId: ID | null
  collectionUid: UID | null
  status: Status | null
  tracks: LineupState<{ dateAdded: Moment }>
  userUid: UID | null
  smartCollectionVariant: SmartCollectionVariant
}

export type CollectionsPageType = 'playlist' | 'album'

export type CollectionTrack = LineupTrack & { dateAdded: Moment }

export type TrackRecord = CollectionTrack & {
  key: string
  name: string
  artist: string
  handle: string
  date: Moment
  time: number
  plays: number | undefined
}

export default CollectionsPageState
