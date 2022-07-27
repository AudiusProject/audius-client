import { ID, Collection, FeedFilter, Track, UserTrack } from '@audius/common'

import AudiusBackend, {
  IDENTITY_SERVICE,
  AuthHeaders
} from 'services/AudiusBackend'
import apiClient from 'services/audius-api-client/AudiusAPIClient'

type CollectionWithScore = Collection & { score: number }

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
  static async getTopUserListens(): Promise<TopUserListen[]> {
    try {
      const { data, signature } = await AudiusBackend.signData()
      return fetch(`${IDENTITY_SERVICE}/users/listens/top`, {
        headers: {
          [AuthHeaders.Message]: data,
          [AuthHeaders.Signature]: signature
        }
      })
        .then((res) => res.json())
        .then((res) => res.listens)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getUserListens(trackIds: ID[]): Promise<UserListens> {
    try {
      const { data, signature } = await AudiusBackend.signData()
      const idQuery = trackIds.map((id) => `&trackIdList=${id}`).join('')
      return fetch(`${IDENTITY_SERVICE}/users/listens?${idQuery}`, {
        headers: {
          [AuthHeaders.Message]: data,
          [AuthHeaders.Signature]: signature
        }
      })
        .then((res) => res.json())
        .then((res) => res.listenMap)
    } catch (e) {
      console.error(e)
      return {}
    }
  }

  static async getTopFolloweeTracksFromWindow(
    window: string,
    limit = 25
  ): Promise<UserTrack[]> {
    try {
      const tracks = await libs().discoveryProvider.getTopFolloweeWindowed(
        'track',
        window,
        limit,
        true
      )
      return tracks
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getFeedNotListenedTo(limit = 25) {
    try {
      const tracks: UserTrack[] = await AudiusBackend.getSocialFeed({
        filter: FeedFilter.ORIGINAL,
        offset: 0,
        limit: 100,
        withUsers: true,
        tracksOnly: true
      })
      const trackIds = tracks
        .map((track: Track) => track.track_id)
        .filter(Boolean)
      const listens: any = await Explore.getUserListens(trackIds)

      const notListenedToTracks = tracks.filter(
        (track: Track) => !listens[track.track_id]
      )
      return notListenedToTracks.slice(0, limit)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getRemixables(currentUserId: ID, limit = 25) {
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
      const playlists = await libs().discoveryProvider.getTopPlaylists(
        type,
        limit,
        undefined,
        followeesOnly ? 'followees' : undefined,
        true
      )
      return playlists
    } catch (e) {
      console.error(e)
      return []
    }
  }

  static async getTopPlaylistsForMood(
    moods: string[],
    limit = 16
  ): Promise<Collection[]> {
    try {
      const requests = moods.map((mood) => {
        return libs().discoveryProvider.getTopPlaylists(
          'playlist',
          limit,
          mood,
          undefined,
          true
        )
      })
      const playlistsByMood = await Promise.all(requests)

      let allPlaylists: CollectionWithScore[] = []
      playlistsByMood.forEach((playlists) => {
        allPlaylists = allPlaylists.concat(playlists)
      })
      return allPlaylists.sort(scoreComparator).slice(0, 20)
    } catch (e) {
      console.error(e)
      return []
    }
  }
}

export default Explore
