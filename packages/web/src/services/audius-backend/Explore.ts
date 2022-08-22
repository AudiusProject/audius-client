import {
  ID,
  Collection,
  FeedFilter,
  UserCollectionMetadata,
  UserTrack,
  removeNullable,
  encodeHashId,
  responseAdapter,
  APIPlaylist,
  APITrack,
  AudiusAPIClient,
  AudiusBackend,
  AuthHeaders
} from '@audius/common'

type CollectionWithScore = APIPlaylist & { score: number }

// @ts-ignore
const libs = () => window.audiusLibs

const scoreComparator = <T extends { score: number }>(a: T, b: T) =>
  b.score - a.score

type TopUserListen = {
  userId: number
  trackId: number
}

type UserListens = {
  [key: number]: number
}

class Explore {
  /** TRACKS ENDPOINTS */
  static async getTopUserListens(
    audiusBackendInstance: AudiusBackend
  ): Promise<TopUserListen[]> {
    try {
      const { data, signature } = await audiusBackendInstance.signData()
      return fetch(
        `${audiusBackendInstance.identityServiceUrl}/users/listens/top`,
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

  static async getUserListens(
    trackIds: ID[],
    audiusBackendInstance: AudiusBackend
  ): Promise<UserListens> {
    try {
      const { data, signature } = await audiusBackendInstance.signData()
      const idQuery = trackIds.map((id) => `&trackIdList=${id}`).join('')
      return fetch(
        `${audiusBackendInstance.identityServiceUrl}/users/listens?${idQuery}`,
        {
          headers: {
            [AuthHeaders.Message]: data,
            [AuthHeaders.Signature]: signature
          }
        }
      )
        .then((res) => res.json())
        .then((res) => res.listenMap)
    } catch (e) {
      console.error(e)
      return {}
    }
  }

  static async getTopFolloweeTracksFromWindow(
    userId: ID,
    window: string,
    limit = 25
  ): Promise<UserTrack[]> {
    try {
      const encodedUserId = encodeHashId(userId)
      const tracks = await libs().discoveryProvider.getBestNewReleases(
        encodedUserId,
        window,
        limit,
        true
      )
      return tracks.map(adapter.makeTrack).filter(removeNullable)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getFeedNotListenedTo(
    limit = 25,
    audiusBackendInstance: AudiusBackend
  ) {
    try {
      const lineupItems = await audiusBackendInstance.getSocialFeed({
        filter: FeedFilter.ORIGINAL,
        offset: 0,
        limit: 100,
        withUsers: true,
        tracksOnly: true
      })

      const tracks = lineupItems.filter(
        (lineupItem): lineupItem is UserTrack => 'track_id' in lineupItem
      )
      const trackIds = tracks.map((track) => track.track_id)

      const listens: any = await Explore.getUserListens(
        trackIds,
        audiusBackendInstance
      )

      const notListenedToTracks = tracks.filter(
        (track) => !listens[track.track_id]
      )
      return notListenedToTracks.slice(0, limit)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getRemixables(
    currentUserId: ID,
    limit = 25,
    apiClient: AudiusAPIClient
  ) {
    try {
      const tracks = await apiClient.getRemixables({
        limit,
        currentUserId
      })

      return tracks
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getTopFolloweeSaves(limit = 25) {
    try {
      const tracks: UserTrack[] =
        await libs().discoveryProvider.getTopFolloweeSaves('track', limit, true)
      return tracks
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getMostLovedTracks(userId: ID, limit = 25) {
    try {
      const encodedUserId = encodeHashId(userId)
      const tracks: APITrack[] =
        await libs().discoveryProvider.getMostLovedTracks(
          encodedUserId,
          limit,
          true
        )
      return tracks.map(adapter.makeTrack).filter(removeNullable)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getLatestTrackID(): Promise<number> {
    try {
      const latestTrackID = await libs().discoveryProvider.getLatest('track')
      return latestTrackID
    } catch (e) {
      console.error(e)
      return 0
    }
  }

  /** PLAYLIST ENDPOINTS */
  static async getTopCollections(
    type?: 'playlist' | 'album',
    followeesOnly?: boolean,
    limit = 20
  ): Promise<Collection[]> {
    try {
      const playlists = await libs().discoveryProvider.getTopFullPlaylists({
        type,
        limit,
        mood: undefined,
        filter: followeesOnly ? 'followees' : undefined,
        withUsers: true
      })
      const adapted = playlists.map(adapter.makePlaylist)
      return adapted
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getTopPlaylistsForMood(
    moods: string[],
    limit = 16
  ): Promise<UserCollectionMetadata[]> {
    try {
      const requests = moods.map((mood) => {
        return libs().discoveryProvider.getTopFullPlaylists({
          type: 'playlist',
          limit,
          mood,
          filter: undefined,
          withUsers: true
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
      return playlists.map(adapter.makePlaylist).filter(removeNullable)
    } catch (e) {
      console.error(e)
      return []
    }
  }
}

export default Explore
