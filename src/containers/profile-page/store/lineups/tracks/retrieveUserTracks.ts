import { ID } from 'models/common/Identifiers'
import Track from 'models/Track'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { processAndCacheTracks } from 'store/cache/tracks/utils'
import { encodeHashId } from 'utils/route/hashIds'

type RetrieveUserTracksArgs = {
  handle: string
  currentUserId?: ID
  sort?: 'date' | 'plays'
  offset?: number
  limit?: number
}

export function* retrieveUserTracks({
  handle,
  currentUserId,
  sort,
  offset,
  limit
}: RetrieveUserTracksArgs): Generator<any, Track[], any> {
  const encodedUserId = currentUserId
    ? encodeHashId(currentUserId) ?? undefined
    : undefined

  const apiTracks = yield apiClient.getUserTracksByHandle({
    handle,
    currentUserId: encodedUserId,
    sort,
    limit,
    offset
  })

  const processed: Track[] = yield processAndCacheTracks(apiTracks)
  return processed
}
