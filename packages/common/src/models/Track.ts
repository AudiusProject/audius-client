import { License } from 'utils/creativeCommons'

import { Nullable } from '../utils/typeUtils'

import { Chain } from './Chain'
import { Favorite } from './Favorite'
import { CID, ID, UID } from './Identifiers'
import { CoverArtSizes } from './ImageSizes'
import { Repost } from './Repost'
import { StemCategory } from './Stems'
import { Timestamped } from './Timestamped'
import { User, UserMetadata } from './User'

type EpochTimeStamp = number

export interface TrackSegment {
  duration: string
  multihash: CID
}

export interface Followee extends User {
  is_delete: boolean
  repost_item_id: string
  repost_type: string
}

export interface Download {
  // TODO: figure out why
  // is_downloadable and requires_follow
  // are randomly null on some tracks
  // returned from the API
  is_downloadable: Nullable<boolean>
  requires_follow: Nullable<boolean>
  cid: Nullable<string>
}

export type FieldVisibility = {
  genre: boolean
  mood: boolean
  tags: boolean
  share: boolean
  play_count: boolean
  remixes: boolean
}

export type Remix = {
  parent_track_id: ID
  user: User | any
  has_remix_author_reposted: boolean
  has_remix_author_saved: boolean
}

export type RemixOf = {
  tracks: Remix[]
}

// Premium content
export type TokenStandard = 'ERC721' | 'ERC1155'

export type PremiumConditionsEthNFTCollection = {
  chain: Chain.Eth
  standard: TokenStandard
  address: string
  name: string
  slug: string
  imageUrl: Nullable<string>
  externalLink: Nullable<string>
}

export type PremiumConditionsSolNFTCollection = {
  chain: Chain.Sol
  address: string
  name: string
  imageUrl: Nullable<string>
  externalLink: Nullable<string>
}

// nft_collection can be undefined during upload flow when user has set track to
// collectible-gated but hasn't specified collection yet, but should always be defined
// after user has set the collection.
export type PremiumConditionsCollectibleGated = {
  nft_collection:
    | PremiumConditionsEthNFTCollection
    | PremiumConditionsSolNFTCollection
    | undefined
}

export type PremiumConditionsFollowGated = { follow_user_id: number }

export type PremiumConditionsTipGated = { tip_user_id: number }

export type PremiumConditionsUSDCPurchase = {
  usdc_purchase: {
    price: number
    splits: Record<ID, number>
  }
}

export type PremiumConditions =
  | PremiumConditionsCollectibleGated
  | PremiumConditionsFollowGated
  | PremiumConditionsTipGated
  | PremiumConditionsUSDCPurchase

export enum PremiumContentType {
  COLLECTIBLE_GATED = 'collectible gated',
  SPECIAL_ACCESS = 'special access',
  USDC_PURCHASE = 'usdc purchase'
}

export const isPremiumContentCollectibleGated = (
  premiumConditions?: Nullable<PremiumConditions>
): premiumConditions is PremiumConditionsCollectibleGated =>
  'nft_collection' in (premiumConditions ?? {})

export const isPremiumContentFollowGated = (
  premiumConditions?: Nullable<PremiumConditions>
): premiumConditions is PremiumConditionsFollowGated =>
  'follow_user_id' in (premiumConditions ?? {})

export const isPremiumContentTipGated = (
  premiumConditions?: Nullable<PremiumConditions>
): premiumConditions is PremiumConditionsTipGated =>
  'tip_user_id' in (premiumConditions ?? {})

export const isPremiumContentUSDCPurchaseGated = (
  premiumConditions?: Nullable<PremiumConditions>
): premiumConditions is PremiumConditionsUSDCPurchase =>
  'usdc_purchase' in (premiumConditions ?? {})

export type PremiumContentSignature = {
  data: string
  signature: string
}

export type EthCollectionMap = {
  [slug: string]: {
    name: string
    address: string
    standard: TokenStandard
    img: Nullable<string>
    externalLink: Nullable<string>
  }
}

export type SolCollectionMap = {
  [mint: string]: {
    name: string
    img: Nullable<string>
    externalLink: Nullable<string>
  }
}

export type PremiumTrackStatus = null | 'UNLOCKING' | 'UNLOCKED' | 'LOCKED'

export type TrackMetadata = {
  ai_attribution_user_id?: number
  blocknumber: number
  activity_timestamp?: string
  is_delete: boolean
  track_id: number
  created_at: string
  isrc: Nullable<string>
  iswc: Nullable<string>
  credits_splits: Nullable<string>
  description: Nullable<string>
  followee_reposts: Repost[]
  followee_saves: Favorite[]
  genre: string
  has_current_user_reposted: boolean
  has_current_user_saved: boolean
  download: Nullable<Download>
  license: Nullable<License>
  mood: Nullable<string>
  play_count: number
  owner_id: ID
  release_date: Nullable<string>
  repost_count: number
  save_count: number
  tags: Nullable<string>
  title: string
  track_segments: TrackSegment[]
  cover_art: Nullable<CID>
  cover_art_sizes: Nullable<CID>
  cover_art_cids?: Nullable<{ [key: string]: string }>
  is_unlisted: boolean
  is_available: boolean
  is_premium: boolean
  premium_conditions: Nullable<PremiumConditions>
  premium_content_signature: Nullable<PremiumContentSignature>
  field_visibility?: FieldVisibility
  listenCount?: number
  permalink: string

  // Optional Fields
  is_playlist_upload?: boolean
  is_invalid?: boolean
  stem_of?: {
    parent_track_id: ID
    category: StemCategory
  }
  remix_of: Nullable<RemixOf>
  preview_start_seconds?: number

  // Added fields
  dateListened?: string
  duration: number

  offline?: OfflineTrackMetadata
} & Timestamped

export type DownloadReason = {
  is_from_favorites?: boolean
  collection_id: ID | string
}

// This is available on mobile for offline tracks
export type OfflineTrackMetadata = {
  reasons_for_download: DownloadReason[]
  download_completed_time?: EpochTimeStamp
  last_verified_time?: EpochTimeStamp
  favorite_created_at?: string
}

export type Stem = {
  track_id: ID
  category: StemCategory
}

export type ComputedTrackProperties = {
  // All below, added clientside
  _cover_art_sizes: CoverArtSizes
  _first_segment?: string
  _followees?: Followee[]
  _marked_deleted?: boolean
  _is_publishing?: boolean
  _stems?: Stem[]

  // Present iff remixes have been fetched for a track
  _remixes?: Array<{ track_id: ID }>
  _remixes_count?: number
  // Present iff remix parents have been fetched for a track
  _remix_parents?: Array<{ track_id: ID }>
  // Present iff the track has been cosigned
  _co_sign?: Nullable<Remix>

  _blocked?: boolean
}

export type Track = TrackMetadata & ComputedTrackProperties

export type UserTrackMetadata = TrackMetadata & { user: UserMetadata }

export type UserTrack = Track & {
  user: User
}

export type LineupTrack = UserTrack & {
  uid: UID
}

// Track with known non-optional stem
export type StemTrackMetadata = TrackMetadata & Required<Pick<Track, 'stem_of'>>
export type StemTrack = Track & Required<Pick<Track, 'stem_of'>>
export type StemUserTrack = UserTrack & Required<Pick<Track, 'stem_of'>>

// Track with known non-optional remix parent
export type RemixTrack = Track & Required<Pick<Track, 'remix_of'>>
export type RemixUserTrack = UserTrack & Required<Pick<Track, 'remix_of'>>

export type TrackImage = Pick<
  Track,
  'cover_art' | 'cover_art_sizes' | 'cover_art_cids'
>
