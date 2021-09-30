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
import AudiusBackend from 'services/AudiusBackend'
import { processAndCacheCollections } from 'store/cache/collections/utils'
import { processAndCacheTracks } from 'store/cache/tracks/utils'
import { LineupSagas } from 'store/lineup/sagas'
import { Kind } from 'store/types'
import { waitForValue } from 'utils/sagaHelpers'

function* getTracks({ offset, limit }) {
  // In the case of sign on, we get an account before we have followed anyone,
  // so we should also wait for account ready.
  const startedSignOn = yield select(getStartedSignOnProcess)
  if (startedSignOn) {
    yield call(waitForValue, getAccountReady)
  }

  const filter = yield select(getFeedFilter)

  const params = {
    offset: 0,
    limit: offset + limit,
    filter: filter
  }

  // If the user just signed up, we might not have a feed ready.
  // Optimistically load the feed as though the follows are all confirmed.
  // null == N/A, true == ready, false == waiting for follows
  const isAccountReady = select(getAccountReady) !== false
  if (!isAccountReady) {
    // Get the artists the user selected in signup:
    const followeeUserIds = select(getFollowIds)
    params.followeeUserIds = followeeUserIds
  }

  // NOTE: The `/feed` does not paginate, so the feed is requested from 0 to N
  const feed = yield call(AudiusBackend.getSocialFeed, params)
  if (!feed.length) return []
  const [tracks, collections] = getTracksAndCollections(feed)
  const trackIds = tracks.map(t => t.track_id)

  // Process (e.g. cache and remove entries)
  const [processedTracks, processedCollections] = yield all([
    processAndCacheTracks(tracks),
    processAndCacheCollections(collections, true, trackIds)
  ])
  const processedTracksMap = processedTracks.reduce(
    (acc, cur) => ({ ...acc, [cur.track_id]: cur }),
    {}
  )
  const processedCollectionsMap = processedCollections.reduce(
    (acc, cur) => ({ ...acc, [cur.playlist_id]: cur }),
    {}
  )
  const processedFeed = feed.map(m =>
    m.track_id
      ? processedTracksMap[m.track_id]
      : processedCollectionsMap[m.playlist_id]
  )
  return processedFeed
}

const getTracksAndCollections = feed =>
  feed.reduce(
    (acc, cur) =>
      cur.track_id ? [[...acc[0], cur], acc[1]] : [acc[0], [...acc[1], cur]],
    [[], []]
  )

const keepActivityTimeStamp = entry => ({
  uid: entry.uid,
  kind: entry.track_id ? Kind.TRACKS : Kind.COLLECTIONS,
  id: entry.track_id || entry.playlist_id,
  activityTimestamp: entry.activity_timestamp
})

class FeedSagas extends LineupSagas {
  constructor() {
    super(
      PREFIX,
      feedActions,
      store => store.feed.feed,
      getTracks,
      keepActivityTimeStamp
    )
  }
}

export default function sagas() {
  return new FeedSagas().getSagas()
}
