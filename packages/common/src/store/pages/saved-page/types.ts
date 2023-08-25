import { full } from '@audius/sdk'
import { Moment } from 'moment'

import { ValueOf } from 'utils/typeUtils'

import {
  UID,
  ID,
  Collection,
  Favorite,
  LineupState,
  LineupTrack
} from '../../../models'

export const LIBRARY_SELECTED_CATEGORY_LS_KEY = 'librarySelectedCategory'

export const LibraryCategory = full.GetUserLibraryTracksTypeEnum
export type LibraryCategoryType = ValueOf<typeof LibraryCategory>

export function isLibraryCategory(value: string): value is LibraryCategoryType {
  return Object.values(LibraryCategory).includes(value as LibraryCategoryType)
}
export interface SavedPageState {
  localSaves: { [id: number]: UID }
  tracks: LineupState<LineupTrack & { id: ID; dateSaved: string }>
  saves: Favorite[]
  hasReachedEnd: boolean
  initialFetch: boolean
  fetchingMore: boolean
  selectedCategory: LibraryCategoryType
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
