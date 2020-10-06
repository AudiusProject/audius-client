import { ID } from 'models/common/Identifiers'
import Track from 'models/Track'
import { all } from 'redux-saga/effects'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { processAndCacheCollections } from 'store/cache/collections/utils'
import { processAndCacheTracks } from 'store/cache/tracks/utils'

const getTracksAndCollections = (feed: any) =>
  feed.reduce(
    (acc: any, cur: any) =>
      cur.track_id ? [[...acc[0], cur], acc[1]] : [acc[0], [...acc[1], cur]],
    [[], []]
  )

type RetrieveUserRepostsArgs = {
  handle: string
  currentUserId: ID | null
  offset?: number
  limit?: number
}

export function* retrieveUserReposts({
  handle,
  currentUserId,
  offset,
  limit
}: RetrieveUserRepostsArgs): Generator<any, Track[], any> {
  const reposts = yield apiClient.getUserRepostsByHandle({
    handle,
    currentUserId,
    limit,
    offset
  })
  const [tracks, collections] = getTracksAndCollections(reposts)
  const trackIds = tracks.map((t: any) => t.track_id)
  const [processedTracks, processedCollections] = yield all([
    processAndCacheTracks(tracks),
    processAndCacheCollections(
      collections,
      /* shouldRetrieveTracks */ false,
      trackIds
    )
  ])
  const processedTracksMap = processedTracks.reduce(
    (acc: any, cur: any) => ({ ...acc, [cur.track_id]: cur }),
    {}
  )
  const processedCollectionsMap = processedCollections.reduce(
    (acc: any, cur: any) => ({ ...acc, [cur.playlist_id]: cur }),
    {}
  )
  const processed = reposts.map((m: any) =>
    m.track_id
      ? processedTracksMap[m.track_id]
      : processedCollectionsMap[m.playlist_id]
  )

  return processed
}
