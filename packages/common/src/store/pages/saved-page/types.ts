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

export const LIBRARY_TRACKS_CATEGORY_LS_KEY = 'libraryTracksCategory'

export const LIBRARY_COLLECTIONS_CATEGORY_LS_KEY = 'libraryCollectionsCategory'

export const LibraryCategory = full.GetUserLibraryTracksTypeEnum
export type LibraryCategoryType = ValueOf<typeof LibraryCategory>

export function isLibraryCategory(value: string): value is LibraryCategoryType {
  return Object.values(LibraryCategory).includes(value as LibraryCategoryType)
}
export interface SavedPageState {
  localTrackFavorites: { [id: number]: UID }
  localTrackReposts: { [id: number]: UID }
  localTrackPurchases: { [id: number]: UID }

  localAlbumFavorites: ID[]
  localAlbumReposts: ID[]
  localAlbumPurchases: ID[]
  localRemovedAlbumFavorites: ID[]
  localRemovedAlbumReposts: ID[]

  localPlaylistFavorites: ID[]
  localPlaylistReposts: ID[]
  localPlaylistPurchases: ID[]
  localRemovedPlaylistFavorites: ID[]
  localRemovedPlaylistResposts: ID[]

  tracks: LineupState<LineupTrack & { id: ID; dateSaved: string }>
  trackSaves: Favorite[]
  hasReachedEnd: boolean
  initialFetch: boolean
  fetchingMore: boolean

  tracksCategory: LibraryCategoryType
  collectionsCategory: LibraryCategoryType
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
