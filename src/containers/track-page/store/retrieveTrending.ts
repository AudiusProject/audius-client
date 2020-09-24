import { getTrendingEntries } from 'containers/discover-page/store/lineups/trending/selectors'
import { getLastFetchedTrendingGenre } from 'containers/discover-page/store/selectors'
import { ID } from 'models/common/Identifiers'
import TimeRange from 'models/TimeRange'
import Track, { UserTrackMetadata } from 'models/Track'
import { select } from 'redux-saga/effects'
import AudiusAPIClient from 'services/audius-api-client/AudiusAPIClient'
import { getTracks } from 'store/cache/tracks/selectors'
import { processAndCacheTracks } from 'store/cache/tracks/utils'
import { AppState } from 'store/types'
import { encodeHashId } from 'utils/route/hashIds'

type RetrieveTrendingArgs = {
  timeRange: TimeRange
  genre?: string
  offset: number
  limit: number
  currentUserId?: ID
}

const apiClient = new AudiusAPIClient({ environment: 'development' })
apiClient.init()
export function* retrieveTrending({
  timeRange,
  genre,
  offset,
  limit,
  currentUserId
}: RetrieveTrendingArgs): Generator<any, Track[], any> {
  const cachedTracks: ReturnType<ReturnType<
    typeof getTrendingEntries
  >> = yield select(getTrendingEntries(timeRange))

  const lastGenre = yield select(getLastFetchedTrendingGenre)
  // TODO: remove this out
  // yield apiClient.init()

  const useCached =
    lastGenre === genre &&
    cachedTracks?.length > 0 &&
    cachedTracks.length > offset + limit

  if (useCached) {
    const trackIds = cachedTracks.slice(offset, limit + offset).map(t => t.id)
    const tracksMap: ReturnType<typeof getTracks> = yield select(
      (state: AppState) => getTracks(state, { ids: trackIds })
    )
    const tracks = trackIds.map(id => tracksMap[id])
    return tracks
  }

  const encodedUserId = currentUserId
    ? encodeHashId(currentUserId) ?? undefined
    : undefined

  const apiTracks: UserTrackMetadata[] = yield apiClient.getTrending({
    genre,
    offset,
    limit,
    currentUserId: encodedUserId,
    timeRange
  })

  const processed: Track[] = yield processAndCacheTracks(apiTracks)
  return processed
}
