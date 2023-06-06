import {
  Collection,
  FeedFilter,
  ID,
  UserCollectionMetadata,
  UserTrack,
  UserTrackMetadata
} from '../../models'
import { encodeHashId, removeNullable } from '../../utils'
import {
  APIPlaylist,
  APITrack,
  AudiusAPIClient,
  responseAdapter
} from '../audius-api-client'
import { AudiusBackend, AuthHeaders } from '../audius-backend'

type CollectionWithScore = APIPlaylist & { score: number }

const scoreComparator = <T extends { score: number }>(a: T, b: T) =>
  b.score - a.score

type TopUserListen = {
  userId: number
  trackId: number
}

type ExploreConfig = {
  audiusBackendInstance: AudiusBackend
  apiClient: AudiusAPIClient
}

export class Explore {
  audiusBackendInstance: AudiusBackend
  apiClient: AudiusAPIClient

  constructor(config: ExploreConfig) {
    this.audiusBackendInstance = config.audiusBackendInstance
    this.apiClient = config.apiClient
  }

  /** TRACKS ENDPOINTS */
  async getTopUserListens(): Promise<TopUserListen[]> {
    try {
      const { data, signature } = await this.audiusBackendInstance.signData()
      return fetch(
        `${this.audiusBackendInstance.identityServiceUrl}/users/listens/top`,
        {
          headers: {
            [AuthHeaders.Message]: data,
            [AuthHeaders.Signature]: signature
          }
        }
      )
        .then((res) => res.json())
        .then((res) => res.listens)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  // TODO(C-2719)
  async getTopFolloweeTracksFromWindow(
    userId: ID,
    window: string,
    limit = 25
  ): Promise<UserTrack[]> {
    try {
      const encodedUserId = encodeHashId(userId)
      const libs = await this.audiusBackendInstance.getAudiusLibs()
      const tracks = await libs.discoveryProvider.getBestNewReleases(
        encodedUserId,
        window,
        limit,
        true
      )
      return tracks.map(responseAdapter.makeTrack).filter(removeNullable)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  async getFeedNotListenedTo(currentUserId: ID, limit = 25) {
    try {
      const lineupItems = (await this.apiClient.getSocialFeed({
        offset: 0,
        limit,
        with_users: true,
        filter: FeedFilter.ORIGINAL,
        tracks_only: true,
        current_user_id: currentUserId
      })) as UserTrackMetadata[] | null
      if (!lineupItems) return []

      const tracks = lineupItems.filter(
        (lineupItem): lineupItem is UserTrack => 'track_id' in lineupItem
      )

      // Imperfect solution. Ideally we use an endpoint that gives us true/false
      // if a user has listened to a passed in array of tracks.
      const history = await this.apiClient.getUserTrackHistory({
        currentUserId,
        userId: currentUserId,
        limit: 50
      })
      const listens = history.map((item) => item.track?.track_id)

      const notListenedToTracks = tracks.filter(
        (track) => !listens[track.track_id]
      )
      return notListenedToTracks.slice(0, limit)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  async getRemixables(currentUserId: ID, limit = 25) {
    try {
      const tracks = await this.apiClient.getRemixables({
        limit,
        currentUserId
      })

      return tracks
    } catch (e) {
      console.error(e)
      return []
    }
  }

  // TODO(C-2719)
  async getTopFolloweeSaves(limit = 25) {
    try {
      const libs = await this.audiusBackendInstance.getAudiusLibs()
      const tracks: UserTrack[] =
        await libs.discoveryProvider.getTopFolloweeSaves('track', limit, true)
      return tracks
    } catch (e) {
      console.error(e)
      return []
    }
  }

  // TODO(C-2719)
  async getMostLovedTracks(userId: ID, limit = 25) {
    try {
      const encodedUserId = encodeHashId(userId)
      const libs = await this.audiusBackendInstance.getAudiusLibs()
      const tracks: APITrack[] =
        await libs.discoveryProvider.getMostLovedTracks(
          encodedUserId,
          limit,
          true
        )
      return tracks.map(responseAdapter.makeTrack).filter(removeNullable)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  // TODO(C-2719)
  async getFeelingLuckyTracks(userId: ID | null, limit = 25) {
    try {
      let tracks: APITrack[]
      const libs = await this.audiusBackendInstance.getAudiusLibs()
      if (userId) {
        const encodedUserId = encodeHashId(userId)
        tracks = await libs.discoveryProvider.getFeelingLuckyTracks(
          encodedUserId,
          limit,
          true
        )
      } else {
        tracks = await libs.discoveryProvider.getFeelingLuckyTracks(
          null,
          limit,
          false
        )
      }
      return tracks.map(responseAdapter.makeTrack).filter(removeNullable)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  /** PLAYLIST ENDPOINTS */
  // TODO(C-2719)
  async getTopCollections(
    type?: 'playlist' | 'album',
    followeesOnly?: boolean,
    limit = 20,
    userId?: number
  ): Promise<Collection[]> {
    try {
      const libs = await this.audiusBackendInstance.getAudiusLibs()
      const playlists = await libs.discoveryProvider.getTopFullPlaylists({
        type,
        limit,
        mood: undefined,
        filter: followeesOnly ? 'followees' : undefined,
        withUsers: true,
        encodedUserId: userId ? encodeHashId(userId) : undefined
      })
      const adapted = playlists.map(responseAdapter.makePlaylist)
      return adapted
    } catch (e) {
      console.error(e)
      return []
    }
  }

  async getTopPlaylistsForMood(
    moods: string[],
    limit = 16,
    userId?: number
  ): Promise<UserCollectionMetadata[]> {
    try {
      const libs = await this.audiusBackendInstance.getAudiusLibs()
      const requests = moods.map((mood) => {
        return libs.discoveryProvider.getTopFullPlaylists({
          type: 'playlist',
          limit,
          mood,
          filter: undefined,
          withUsers: true,
          encodedUserId: userId ? encodeHashId(userId) : undefined
        })
      })
      const playlistsByMood: CollectionWithScore[] = await Promise.all(requests)
      let allPlaylists: CollectionWithScore[] = []
      playlistsByMood.forEach((playlists) => {
        allPlaylists = allPlaylists.concat(playlists)
      })
      const playlists: APIPlaylist[] = allPlaylists
        .sort(scoreComparator)
        .slice(0, 20)
      return playlists.map(responseAdapter.makePlaylist).filter(removeNullable)
    } catch (e) {
      console.error(e)
      return []
    }
  }
}
