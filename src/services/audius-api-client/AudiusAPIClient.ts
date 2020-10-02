import TimeRange from 'models/TimeRange'
import { removeNullable } from 'utils/typeUtils'
import { APIResponse, APITrack, APIUser } from './types'
import * as adapter from './ResponseAdapter'
import AudiusBackend from 'services/AudiusBackend'
import { getEagerDiscprov } from 'services/audius-backend/eagerLoadUtils'

const ENDPOINT_MAP = {
  trending: '/tracks/trending',
  following: (userId: string) => `/users/${userId}/following`,
  followers: (userId: string) => `/users/${userId}/followers`,
  trackRepostUsers: (trackId: string) => `/tracks/${trackId}/reposts`,
  trackFavoriteUsers: (trackId: string) => `/tracks/${trackId}/favorites`,
  playlistRepostUsers: (playlistId: string) =>
    `/playlists/${playlistId}/reposts`,
  playlistFavoriteUsers: (playlistId: string) =>
    `/playlists/${playlistId}/favorites`
}

const TRENDING_LIMIT = 100

type GetTrendingArgs = {
  timeRange?: TimeRange
  offset?: number
  limit?: number
  currentUserId?: string
  genre?: string
}

type GetFollowingArgs = {
  profileUserId: string
  currentUserId?: string
  offset?: number
  limit?: number
}

type GetFollowersArgs = {
  profileUserId: string
  currentUserId?: string
  offset?: number
  limit?: number
}

type GetTrackRepostUsersArgs = {
  trackId: string
  currentUserId?: string
  limit?: number
  offset?: number
}

type GetTrackFavoriteUsersArgs = {
  trackId: string
  currentUserId?: string
  limit?: number
  offset?: number
}

type GetPlaylistRepostUsersArgs = {
  playlistId: string
  currentUserId?: string
  limit?: number
  offset?: number
}

type GetPlaylistFavoriteUsersArgs = {
  playlistId: string
  currentUserId?: string
  limit?: number
  offset?: number
}

type InitializationState =
  | { state: 'uninitialized ' }
  | {
      state: 'initialized'
      endpoint: string
    }

class AudiusAPIClient {
  initializationState: InitializationState = { state: 'uninitialized ' }
  overrideEndpoint?: string

  constructor({ overrideEndpoint }: { overrideEndpoint?: string } = {}) {
    this.overrideEndpoint = overrideEndpoint
  }

  async getTrending({
    timeRange = TimeRange.WEEK,
    limit = TRENDING_LIMIT,
    offset = 0,
    currentUserId,
    genre
  }: GetTrendingArgs) {
    this._assertInitialized()
    const params = {
      time: timeRange,
      limit,
      offset,
      user_id: currentUserId,
      genre
    }

    const endpoint = this._constructUrl(ENDPOINT_MAP.trending, params)
    const trendingResponse: APIResponse<APITrack[]> = await this._getResponse(
      endpoint
    )
    const adapted = trendingResponse.data
      .map(adapter.makeTrack)
      .filter(removeNullable)
    return adapted
  }

  async getFollowing({
    currentUserId,
    profileUserId,
    limit,
    offset
  }: GetFollowingArgs) {
    this._assertInitialized()
    const params = {
      user_id: currentUserId,
      limit,
      offset
    }
    const endpoint = this._constructUrl(
      ENDPOINT_MAP.following(profileUserId),
      params
    )
    const followingResponse: APIResponse<APIUser[]> = await this._getResponse(
      endpoint
    )
    const adapted = followingResponse.data
      .map(adapter.makeUser)
      .filter(removeNullable)
    return adapted
  }

  async getFollowers({
    currentUserId,
    profileUserId,
    limit,
    offset
  }: GetFollowersArgs) {
    this._assertInitialized()
    const params = {
      user_id: currentUserId,
      limit,
      offset
    }
    const endpoint = this._constructUrl(
      ENDPOINT_MAP.followers(profileUserId),
      params
    )
    const followersResponse: APIResponse<APIUser[]> = await this._getResponse(
      endpoint
    )
    const adapted = followersResponse.data
      .map(adapter.makeUser)
      .filter(removeNullable)
    return adapted
  }

  async getTrackRepostUsers({
    currentUserId,
    trackId,
    limit,
    offset
  }: GetTrackRepostUsersArgs) {
    this._assertInitialized()
    const params = {
      user_id: currentUserId,
      limit,
      offset
    }
    const endpoint = this._constructUrl(
      ENDPOINT_MAP.trackRepostUsers(trackId),
      params
    )
    const repostUsers: APIResponse<APIUser[]> = await this._getResponse(
      endpoint
    )
    const adapted = repostUsers.data
      .map(adapter.makeUser)
      .filter(removeNullable)
    return adapted
  }

  async getTrackFavoriteUsers({
    currentUserId,
    trackId,
    limit,
    offset
  }: GetTrackFavoriteUsersArgs) {
    this._assertInitialized()
    const params = {
      user_id: currentUserId,
      limit,
      offset
    }
    const endpoint = this._constructUrl(
      ENDPOINT_MAP.trackFavoriteUsers(trackId),
      params
    )
    const followingResponse: APIResponse<APIUser[]> = await this._getResponse(
      endpoint
    )
    const adapted = followingResponse.data
      .map(adapter.makeUser)
      .filter(removeNullable)
    return adapted
  }

  async getPlaylistRepostUsers({
    currentUserId,
    playlistId,
    limit,
    offset
  }: GetPlaylistRepostUsersArgs) {
    this._assertInitialized()
    const params = {
      user_id: currentUserId,
      limit,
      offset
    }
    const endpoint = this._constructUrl(
      ENDPOINT_MAP.playlistRepostUsers(playlistId),
      params
    )
    const repostUsers: APIResponse<APIUser[]> = await this._getResponse(
      endpoint
    )
    const adapted = repostUsers.data
      .map(adapter.makeUser)
      .filter(removeNullable)
    return adapted
  }

  async getPlaylistFavoriteUsers({
    currentUserId,
    playlistId,
    limit,
    offset
  }: GetPlaylistFavoriteUsersArgs) {
    this._assertInitialized()
    const params = {
      user_id: currentUserId,
      limit,
      offset
    }
    const endpoint = this._constructUrl(
      ENDPOINT_MAP.playlistFavoriteUsers(playlistId),
      params
    )
    const followingResponse: APIResponse<APIUser[]> = await this._getResponse(
      endpoint
    )
    const adapted = followingResponse.data
      .map(adapter.makeUser)
      .filter(removeNullable)
    return adapted
  }

  init() {
    if (this.initializationState.state === 'initialized') return

    // If override passed, use that and return
    if (this.overrideEndpoint) {
      const endpoint = this._formatEndpoint(this.overrideEndpoint)
      console.debug(`APIClient: Using override endpoint: ${endpoint}`)
      this.initializationState = { state: 'initialized', endpoint: endpoint }
      return
    }

    // Set the state to the eager discprov
    const eagerDiscprov = getEagerDiscprov()
    const fullDiscprov = this._formatEndpoint(eagerDiscprov)
    console.debug(`APIClient: setting to eager discprov: ${fullDiscprov}`)
    this.initializationState = {
      state: 'initialized',
      endpoint: fullDiscprov
    }

    // Listen for libs on chain selection
    AudiusBackend.addDiscoveryProviderSelectionListener((endpoint: string) => {
      const fullEndpoint = this._formatEndpoint(endpoint)
      console.debug(`APIClient: Setting to libs discprov: ${fullEndpoint}`)
      this.initializationState = {
        state: 'initialized',
        endpoint: fullEndpoint
      }
    })
    console.debug('APIClient: Initialized')
  }

  // Helpers

  _assertInitialized() {
    if (this.initializationState.state !== 'initialized')
      throw new Error('AudiusAPIClient must be initialized before use')
  }

  async _getResponse<T>(resource: string): Promise<T> {
    const response = await fetch(resource)
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  }

  _formatEndpoint(endpoint: string) {
    return `${endpoint}/v1/full`
  }

  _constructUrl(
    path: string,
    queryParams: { [key: string]: string | number | undefined | null }
  ) {
    if (this.initializationState.state !== 'initialized')
      throw new Error('_constructURL called uninitialized')
    const params = Object.entries(queryParams)
      .filter(p => p[1] !== undefined && p[1] !== null)
      .map(p => `${p[0]}=${encodeURIComponent(p[1]!)}`)
      .join('&')
    return `${this.initializationState.endpoint}${path}?${params}`
  }
}

const instance = new AudiusAPIClient()

export default instance
