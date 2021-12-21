import { ID } from 'common/models/Identifiers'
import { Track } from 'common/models/Track'
import { processAndCacheTracks } from 'common/store/cache/tracks/utils'
import apiClient from 'services/audius-api-client/AudiusAPIClient'

type RetrieveUserTracksArgs = {
  handle: string
  currentUserId: ID | null
  sort?: 'date' | 'plays'
  offset?: number
  limit?: number
  getUnlisted?: boolean
}

export function* retrieveUserTracks({
  handle,
  currentUserId,
  sort,
  offset,
  limit,
  getUnlisted = false
}: RetrieveUserTracksArgs): Generator<any, Track[], any> {
  const apiTracks = yield apiClient.getUserTracksByHandle({
    handle,
    currentUserId,
    sort,
    limit,
    offset,
    getUnlisted
  })

  const processed: Track[] = yield processAndCacheTracks(apiTracks)
  return processed
}
