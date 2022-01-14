import { Repost } from 'audius-client/src/common/models/Repost'
import { TrackSegment } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'

import { CollectionImage } from 'app/models/Collection'
import { TrackImage } from 'app/models/Track'
import { UserImage, UserMultihash } from 'app/models/User'

type BaseUser = Pick<
  User,
  'name' | 'is_verified' | 'associated_wallets_balance' | 'balance'
>

export type SearchUser = UserMultihash &
  UserImage &
  BaseUser & {
    album_count: null
    bio: string
    followee_count: null
    follower_count: 3
    handle: string
    is_verified: boolean
    location: string
    name: string
    playlist_count: null
    repost_count: null
    track_count: null
    blocknumber: number
    wallet: string
    created_at: string
    current_user_followee_follow_count: null
    does_current_user_follow: null
    handle_lc: string
    is_creator: true
    updated_at: string
    has_collectibles: boolean
    user_id: number
  }

export type SearchTrack = TrackImage & {
  description: string | null
  genre: string
  mood: string
  release_date: null
  remix_of: null
  repost_count: number
  tags: null
  title: string
  user: SearchUser
  duration: number
  play_count: null
  blocknumber: number
  create_date: null
  created_at: string
  credits_splits: null
  download: {
    cid: null
    is_downloadable: false
    requires_follow: false
  }
  isrc: null
  license: null
  iswc: null
  field_visibility: {
    mood: boolean
    tags: boolean
    genre: boolean
    share: boolean
    play_count: boolean
    remixes: null
  }
  followee_reposts: Repost[]
  has_current_user_reposted: null
  is_unlisted: boolean
  has_current_user_saved: null
  stem_of: null
  updated_at: string
  is_delete: boolean
  track_id: number
  owner_id: number
  followee_saves: []
  save_count: null
  track_segments: TrackSegment[]
  followee_favorites: null
  user_id: number
  permalink: string
}

export type SearchPlaylist = CollectionImage & {
  description: string | null
  is_album: boolean
  playlist_name: string
  repost_count: number
  total_play_count: null
  user: SearchUser
  blocknumber: number
  created_at: string
  followee_reposts: []
  has_current_user_reposted: null
  has_current_user_saved: null
  is_delete: boolean
  is_private: boolean
  updated_at: string
  tracks: []
  track_count: number
  variant: string
  playlist_id: number
  playlist_owner_id: number
  followee_saves: []
  save_count: null
  playlist_contents: {
    track_ids: {
      track: number
      time: number
    }[]
  }
}

export type SearchResults = {
  users: SearchUser[]
  tracks: SearchTrack[]
  playlists: SearchPlaylist[]
  albums: SearchPlaylist[]
}
export type SectionHeader = keyof SearchResults
