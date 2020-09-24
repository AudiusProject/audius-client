import { CID } from 'models/common/Identifiers'
import {
  CoverArtSizes,
  CoverPhotoSizes,
  ProfilePictureSizes
} from 'models/common/ImageSizes'
import Favorite, { FavoriteType } from 'models/Favorite'
import Repost from 'models/Repost'
import TimeRange from 'models/TimeRange'
import {
  Download,
  FieldVisibility,
  Remix,
  TrackMetadata,
  TrackSegment
} from 'models/Track'
import { UserMetadata } from 'models/User'
import { decodeHashId } from 'utils/route/hashIds'
import { Nullable, removeNullable } from 'utils/typeUtils'

type Environment = 'production' | 'staging' | 'development'

const ENDPOINT_PROVIDER_MAP: { [env in Environment]: string } = {
  development: 'http://docker.for.mac.localhost:5000',
  staging: '',
  production: 'https://api.audius.co'
}

type OpaqueID = string

// TODO: Autogen these from swagger, eventually

type APIUser = {
  album_count: number
  bio: Nullable<string>
  cover_photo: CoverPhotoSizes
  followee_count: number
  follower_count: number
  handle: string
  id: OpaqueID
  is_verified: boolean
  location: Nullable<string>
  name: string
  playlist_count: number
  profile_picture: ProfilePictureSizes
  repost_count: number
  track_count: number
  created_at: string
  creator_node_endpoint: Nullable<string>
  current_user_followee_follow_count: number
  does_current_user_follow: boolean
  handle_lc: string
  is_creator: boolean
  updated_at: string
  cover_photo_sizes: Nullable<CID>
  profile_picture_sizes: Nullable<CID>
}

export type APIRepost = {
  repost_item_id: string
  repost_type: string
  user_id: string
}

export type APIFavorite = {
  favorite_item_id: string
  favorite_type: FavoriteType
  user_id: string
}

export type APIRemix = {
  parent_track_id: OpaqueID
  user: APIUser
  has_remix_author_reposted: boolean
  has_remix_author_saved: boolean
}

export type APITrack = {
  artwork: CoverArtSizes
  description: Nullable<string>
  genre: string
  id: OpaqueID
  mood: Nullable<string>
  release_date: Nullable<string>
  remix_of: {
    tracks: null | APIRemix[]
  }
  repost_count: number
  favorite_count: number
  tags: Nullable<string>
  title: string
  // TODO
  user: APIUser
  duration: number
  downloadable: boolean
  create_date: Nullable<string>
  created_at: string
  credits_splits: Nullable<string>
  cover_art_sizes: string
  download: Download
  isrc: Nullable<string>
  license: Nullable<string>
  iswc: Nullable<string>
  field_visibility: FieldVisibility
  followee_reposts: APIRepost[]
  has_current_user_reposted: boolean
  is_unlisted: boolean
  has_current_user_saved: boolean
  followee_favorites: APIFavorite[]
  route_id: string
  stem_of: any
  track_segments: TrackSegment[]
  updated_at: string
  user_id: OpaqueID
  is_delete: boolean
  cover_art: Nullable<string>
  play_count: number
}

type APIResponse<T> = {
  data: T
}

export type UserTrackMetadata = TrackMetadata & { user: UserMetadata }

class APIClientMarshaller {
  marshalUser(user: APIUser): UserMetadata | undefined {
    const decodedUserId = decodeHashId(user.id)
    if (!decodedUserId) {
      return undefined
    }

    const newUser = {
      ...user,
      user_id: decodedUserId,
      cover_photo: user.cover_photo_sizes,
      profile_picture: user.profile_picture_sizes,
      id: undefined
    }

    delete newUser.id

    return newUser
  }

  marshalFavorite(favorite: APIFavorite): Favorite | undefined {
    const decodedSaveItemId = decodeHashId(favorite.favorite_item_id)
    const decodedUserId = decodeHashId(favorite.user_id)
    if (!decodedSaveItemId || !decodedUserId) {
      // TODO: handle this better
      return undefined
    }
    return {
      save_item_id: decodedSaveItemId,
      user_id: decodedUserId,
      save_type: favorite.favorite_type
    }
  }

  marshalRepost(repost: APIRepost): Repost | undefined {
    const decodedRepostItemId = decodeHashId(repost.repost_item_id)
    const decodedUserId = decodeHashId(repost.user_id)
    if (!decodedRepostItemId || !decodedUserId) {
      // TODO
      return undefined
    }

    return {
      repost_item_id: decodedRepostItemId,
      user_id: decodedUserId,
      repost_type: repost.repost_type
    }
  }

  marshalRemix(remix: APIRemix): Remix | undefined {
    const decodedTrackId = decodeHashId(remix.parent_track_id)
    const user = this.marshalUser(remix.user)
    if (!decodedTrackId || !user) {
      return undefined
    }

    return {
      ...remix,
      parent_track_id: decodedTrackId,
      user
    }
  }

  marshalTrack(track: APITrack): UserTrackMetadata | undefined {
    // TODO: if I get this working, let's look into io.TS...
    const decodedTrackId = decodeHashId(track.id)
    const decodedOwnerId = decodeHashId(track.user_id)
    const user = this.marshalUser(track.user)
    if (!decodedTrackId || !decodedOwnerId || !user) {
      // TODO: handle errors better
      return undefined
    }

    const saves = track.followee_favorites
      .map(this.marshalFavorite)
      .filter(removeNullable)

    const reposts = track.followee_reposts
      .map(this.marshalRepost)
      .filter(removeNullable)

    const remixes =
      track.remix_of.tracks?.map(this.marshalRemix).filter(removeNullable) ?? []

    const marshalled = {
      ...track,
      user,
      track_id: decodedTrackId,
      owner_id: decodedOwnerId,
      followee_saves: saves,
      followee_reposts: reposts,
      save_count: track.favorite_count,
      remix_of:
        remixes.length > 0
          ? {
              tracks: remixes
            }
          : null,

      stem_of: track.stem_of.parent_track_id === null ? null : track.stem_of,

      // Fields to prune
      id: undefined,
      user_id: undefined,
      followee_favorites: undefined,
      artwork: undefined,
      downloadable: undefined,
      favorite_count: undefined
    }

    delete marshalled.id
    delete marshalled.user_id
    delete marshalled.followee_favorites
    delete marshalled.artwork
    delete marshalled.downloadable
    delete marshalled.favorite_count

    return marshalled
  }
}

type GetTrendingArgs = {
  timeRange?: TimeRange
  offset?: number
  limit?: number
  currentUserId?: string
  genre?: string
}

class AudiusAPIClient {
  isInitialized = false
  endpoint: string | null = null
  environment: Environment
  marshaller: APIClientMarshaller

  constructor({ environment }: { environment: Environment }) {
    this.environment = environment
    this.marshaller = new APIClientMarshaller()
  }

  async getTrending({
    timeRange = TimeRange.WEEK,
    limit = 200,
    offset = 0,
    currentUserId,
    genre
  }: GetTrendingArgs) {
    this.assertDidIntialize()
    // TODO: use a query builder
    let endpoint = `${this.endpoint}/tracks/trending?time=${timeRange}&limit=${limit}&offset=${offset}`
    if (currentUserId) {
      endpoint = `${endpoint}&user_id=${currentUserId}`
    }
    if (genre) {
      endpoint = `${endpoint}&genre=${genre}`
    }

    const trendingResponse: APIResponse<APITrack[]> = await this.getResponse(
      endpoint
    )
    const marshalled = trendingResponse.data
      .map(t => this.marshaller.marshalTrack(t))
      .filter(removeNullable)
    console.log(marshalled)
    return marshalled
  }

  async init() {
    if (this.isInitialized) return

    try {
      let endpoint
      if (this.environment === 'development') {
        // Hardcode local DP as endpoint if in development
        // env
        endpoint = ENDPOINT_PROVIDER_MAP[this.environment]
      } else {
        const endpointProvider = ENDPOINT_PROVIDER_MAP[this.environment]
        const endpointsResponse = await fetch(endpointProvider)
        const endpointsJson = await endpointsResponse.json()
        const { data: endpoints }: { data: string[] } = endpointsJson
        endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
      }
      this.endpoint = `${endpoint}/v1/full`
      this.isInitialized = true
    } catch {
      // TODO: handle this
    }
  }

  assertDidIntialize() {
    // TODO
  }

  // Helpers
  async getResponse<T>(resource: string): Promise<T> {
    const response = await fetch(resource)
    return response.json()
  }
}

export default AudiusAPIClient
