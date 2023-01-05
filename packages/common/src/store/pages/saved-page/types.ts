import { Moment } from 'moment'

import {
  UID,
  ID,
  Collection,
  Favorite,
  LineupState,
  LineupTrack,
  Status
} from '../../../models'

export interface SavedPageState {
  localSaves: { [id: number]: UID }
  tracks: LineupState<LineupTrack & { id: ID; dateSaved: string }>
  saves: Favorite[]
  hasReachedEnd: boolean
  initialFetch: Status
}

export enum SavedPageTabs {
  TRACKS = 'TRACKS',
  ALBUMS = 'ALBUMS',
  PLAYLISTS = 'PLAYLISTS'
}

export type SavedPageTrack = LineupTrack & { dateSaved: string }

export type TrackRecord = SavedPageTrack & {
  key: string
  name: string
  artist: string
  handle: string
  date: Moment
  time: number
  plays: number | undefined
}

export type SavedPageCollection = Collection & {
  ownerHandle: string
}
