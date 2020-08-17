import { ID, UID } from 'models/common/Identifiers'
import { LineupState } from 'models/common/Lineup'
import { LineupTrack } from 'models/Track'
import { Moment } from 'moment'
import { Status } from 'store/types'
import { SmartCollectionVariant } from 'containers/smart-collection/types'

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
