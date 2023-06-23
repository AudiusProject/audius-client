import type { FunctionComponent, SVGProps } from 'react'

import { CID, ID, UID } from '../models/Identifiers'
import { CoverArtSizes } from '../models/ImageSizes'
import { Repost } from '../models/Repost'
import { Nullable } from '../utils/typeUtils'

import { Favorite } from './Favorite'
import { UserTrackMetadata } from './Track'
import { User, UserMetadata } from './User'

export enum Variant {
  USER_GENERATED = 'user-generated',
  SMART = 'smart'
}

export type PlaylistTrackId = {
  time: number
  track: ID
  metadata_time?: number
  uid?: UID
}

type PlaylistContents = {
  track_ids: Array<PlaylistTrackId | { track: string }>
}

export type CollectionMetadata = {
  blocknumber: number
  variant: Variant.USER_GENERATED
  description: Nullable<string>
  followee_reposts: Repost[]
  followee_saves: Favorite[]
  has_current_user_reposted: boolean
  has_current_user_saved: boolean
  is_album: boolean
  is_delete: boolean
  is_private: boolean
  playlist_contents: {
    track_ids: PlaylistTrackId[]
  }
  tracks?: UserTrackMetadata[]
  track_count: number
  playlist_id: ID
  cover_art: CID | null
  cover_art_sizes: Nullable<CID>
  permalink?: string
  playlist_name: string
  playlist_owner_id: ID
  repost_count: number
  save_count: number
  upc?: string | null
  updated_at: string
  activity_timestamp?: string
  playlist_image_multihash?: string
  playlist_image_sizes_multihash?: string
  offline?: OfflineCollectionMetadata
}

export type CollectionDownloadReason = { is_from_favorites: boolean }

// This is available on mobile for offline tracks
export type OfflineCollectionMetadata = {
  reasons_for_download: CollectionDownloadReason[]
}

export type ComputedCollectionProperties = {
  _is_publishing?: boolean
  _marked_deleted?: boolean
  _cover_art_sizes: CoverArtSizes
  _moved?: UID
  _temp?: boolean
  artwork?: { file?: File; url?: string }
}

export type Collection = CollectionMetadata & ComputedCollectionProperties

export type UserCollectionMetadata = CollectionMetadata & { user: UserMetadata }

export type UserCollection = Collection & {
  user: User
}

export type SmartCollection = {
  variant: Variant.SMART
  playlist_name: string
  description?: string
  makeDescription?: (...args: any) => string
  // Where this type of playlist is given a different classification
  // e.g. "Audio NFT Playlist" instead of just "Playlist"
  typeTitle?: 'Playlist' | 'Audio NFT Playlist'
  gradient?: string
  imageOverride?: string
  shadow?: string
  icon?: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>
  link: string
  playlist_contents?: PlaylistContents
  has_current_user_saved?: boolean
  incentivized?: boolean // Whether we reward winners with Audio
  cardSensitivity?: number
  customEmptyText?: string
}

export type CollectionImage = {
  cover_art: Nullable<CID>
  cover_art_sizes: Nullable<CID>
}
