import { call, select, all } from 'redux-saga/effects'

import {
  PREFIX,
  feedActions
} from 'containers/feed-page/store/lineups/feed/actions'
import { getFeedFilter } from 'containers/feed-page/store/selectors'
import {
  getAccountReady,
  getFollowIds,
  getStartedSignOnProcess
} from 'containers/sign-on/store/selectors'
import Collection, { UserCollectionMetadata } from 'models/Collection'
import { LineupTrack, TrackMetadata } from 'models/Track'
import { ID } from 'models/common/Identifiers'
import apiClient, {
  GetSocialFeedArgs
} from 'services/audius-api-client/AudiusAPIClient'
import { processAndCacheCollections } from 'store/cache/collections/utils'
import { processAndCacheTracks } from 'store/cache/tracks/utils'
import { LineupSagas } from 'store/lineup/sagas'
import { AppState, Kind } from 'store/types'

type FeedItem = LineupTrack | Collection

function* getTracks({
  offset,
  limit
}: {
  offset: number
  limit: number
}): Generator<any, FeedItem[], any> {
  const filter = yield select(getFeedFilter)

  // NOTE: The `/feed` does not paginate, so the feed is requested from 0 to N
  const params: GetSocialFeedArgs = {
    offset: 0,
    limit: offset + limit,
    filter: filter
  }

  // If the user just signed up, we might not have a feed ready.
  // Optimistically load the feed as though the follows are all confirmed.
  const startedSignOn = yield select(getStartedSignOnProcess)
  if (startedSignOn) {
    const isAccountReady = yield select(getAccountReady)
    if (!isAccountReady) {
      // Get the artists the user selected in signup:
      const followeeUserIds = yield select(getFollowIds)
      params.followee_user_ids = followeeUserIds
    }
  }

  const feed: (
    | TrackMetadata
    | UserCollectionMetadata
  )[] = yield apiClient.getSocialFeed(params)
  if (!feed.length) return []
  const [tracks, collections] = getTracksAndCollections(feed)
  const trackIds = tracks.map(t => t.track_id)

  // Process (e.g. cache and remove entries)
  const [processedTracks, processedCollections]: [
    LineupTrack[],
    Collection[]
  ] = yield all([
    processAndCacheTracks(tracks),
    processAndCacheCollections(collections, true, trackIds)
  ])
  const processedTracksMap = processedTracks.reduce<Record<ID, LineupTrack>>(
    (acc, cur) => ({ ...acc, [cur.track_id]: cur }),
    {}
  )
  const processedCollectionsMap = processedCollections.reduce<
    Record<ID, Collection>
  >((acc, cur) => ({ ...acc, [cur.playlist_id]: cur }), {})
  const processedFeed: FeedItem[] = feed.map(m =>
    (m as LineupTrack).track_id
      ? processedTracksMap[(m as LineupTrack).track_id]
      : processedCollectionsMap[(m as UserCollectionMetadata).playlist_id]
  )
  return processedFeed
}

const getTracksAndCollections = (
  feed: Array<TrackMetadata | UserCollectionMetadata>
) =>
  feed.reduce<[LineupTrack[], UserCollectionMetadata[]]>(
    (acc, cur) =>
      (cur as LineupTrack).track_id
        ? [[...acc[0], cur as LineupTrack], acc[1]]
        : [acc[0], [...acc[1], cur as UserCollectionMetadata]],
    [[], []]
  )

const keepActivityTimeStamp = (
  entry: (LineupTrack | Collection) & { uid: string } // LineupSaga adds a UID to each entry
) => ({
  uid: entry.uid,
  kind: (entry as LineupTrack).track_id ? Kind.TRACKS : Kind.COLLECTIONS,
  id: (entry as LineupTrack).track_id || (entry as Collection).playlist_id,
  activityTimestamp: entry.activity_timestamp
})

class FeedSagas extends LineupSagas {
  constructor() {
    super(
      PREFIX,
      feedActions,
      (store: AppState) => store.feed.feed,
      getTracks,
      keepActivityTimeStamp
    )
  }
}

export default function sagas() {
  return new FeedSagas().getSagas()
}
