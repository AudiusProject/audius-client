import { spawn, call, select, put } from 'redux-saga/effects'
import { reformat } from './reformat'
import { retrieve } from 'store/cache/sagas'
import { getEntryTimestamp } from 'store/cache/selectors'
import { ID } from 'models/common/Identifiers'
import { getTracks as getTracksSelector } from 'store/cache/tracks/selectors'
import { Kind, AppState, Status } from 'store/types'
import { addUsersFromTracks } from './helpers'
import AudiusBackend from 'services/AudiusBackend'
import Track, { TrackMetadata, UserTrackMetadata } from 'models/Track'
import {
  fetchAndProcessRemixes,
  fetchAndProcessRemixParents
} from './fetchAndProcessRemixes'
import { fetchAndProcessStems } from './fetchAndProcessStems'
import apiClient from 'services/audius-api-client/AudiusAPIClient'
import { getUserId } from 'store/account/selectors'
import { setTracksIsBlocked } from './blocklist'
import * as trackActions from 'store/cache/tracks/actions'

type UnlistedTrackRequest = { id: ID; url_title: string; handle: string }
type RetrieveTracksArgs = {
  trackIds: ID[] | UnlistedTrackRequest[]
  canBeUnlisted?: boolean
  withStems?: boolean
  withRemixes?: boolean
  withRemixParents?: boolean
  forceRetrieveFromSource?: boolean
}
type RetrieveTrackByHandleAndSlugArgs = { handle: string; slug: string }

export function* retrieveTrackByHandleAndSlug({
  handle,
  slug
}: RetrieveTrackByHandleAndSlugArgs) {
  const permalink = `/${handle}/${slug}`
  const tracks: { entries: { [permalink: string]: Track } } = yield call(
    retrieve,
    {
      ids: [permalink],
      selectFromCache: function* (permalinks: string[]) {
        const track: TrackMetadata = yield select(getTracksSelector, {
          permalinks
        })
        return track
      },
      retrieveFromSource: function* (permalinks: string[]) {
        const track: UserTrackMetadata = yield call(args => {
          const split = args[0].split('/')
          const handle = split[1]
          const slug = split.slice(2).join('')
          return apiClient.getTrackByHandleAndSlug({ handle, slug })
        }, permalinks)
        return track
      },
      kind: Kind.TRACKS,
      idField: 'track_id',
      forceRetrieveFromSource: false,
      shouldSetLoading: true,
      deleteExistingEntry: false,
      getEntriesTimestamp: function* (ids: ID[]) {
        const selected = yield select(
          (state: AppState, ids: ID[]) =>
            ids.reduce((acc, id) => {
              acc[id] = getEntryTimestamp(state, { kind: Kind.TRACKS, id })
              return acc
            }, {} as { [id: number]: number | null }),
          ids
        )
        return selected
      },
      onBeforeAddToCache: function* (tracks: TrackMetadata[]) {
        yield addUsersFromTracks(tracks)
        yield put(
          trackActions.setPermalinkStatus([
            {
              permalink,
              id: tracks[0].track_id,
              status: Status.SUCCESS
            }
          ])
        )
        const checkedTracks = yield call(setTracksIsBlocked, tracks)
        return checkedTracks.map(reformat)
      }
    }
  )
  return tracks.entries[permalink]
}

/**
 * Retrieves tracks either from cache or from source.
 * Optionally:
 * - retrieves hiddenTracks.
 * - includes stems of a parent track.
 * - includes remixes of a parent track.
 * - includes the remix parents of a track.
 *
 * If retrieving unlisted tracks, request tracks as an array of `UnlistedTrackRequests.`
 */
export function* retrieveTracks({
  trackIds,
  canBeUnlisted = false,
  withStems = false,
  withRemixes = false,
  withRemixParents = false
}: RetrieveTracksArgs) {
  const currentUserId: number | null = yield select(getUserId)

  // In the case of unlisted tracks, trackIds contains metadata used to fetch tracks
  const ids = canBeUnlisted
    ? (trackIds as UnlistedTrackRequest[]).map(({ id }) => id)
    : (trackIds as ID[])

  if (canBeUnlisted && withStems) {
    yield spawn(function* () {
      if (ids.length > 1) {
        console.warn('Stems endpoint only supports fetching single tracks')
        return
      }
      const trackId = ids[0]
      if (!trackId) return
      yield call(fetchAndProcessStems, trackId)
    })
  }

  if (withRemixes) {
    yield spawn(function* () {
      if (ids.length > 1) {
        console.warn('Remixes endpoint only supports fetching single tracks')
        return
      }
      const trackId = ids[0]
      if (!trackId) return
      yield call(fetchAndProcessRemixes, trackId)
    })
  }

  if (withRemixParents) {
    yield spawn(function* () {
      if (ids.length > 1) {
        console.warn(
          'Remix parents endpoint only supports fetching single tracks'
        )
        return
      }
      const trackId = ids[0]
      if (!trackId) return
      yield call(fetchAndProcessRemixParents, trackId)
    })
  }

  const tracks: { entries: { [id: number]: Track } } = yield call(retrieve, {
    ids,
    selectFromCache: function* (ids: ID[]) {
      return yield select(getTracksSelector, { ids })
    },
    getEntriesTimestamp: function* (ids: ID[]) {
      const selected = yield select(
        (state: AppState, ids: ID[]) =>
          ids.reduce((acc, id) => {
            acc[id] = getEntryTimestamp(state, { kind: Kind.TRACKS, id })
            return acc
          }, {} as { [id: number]: number | null }),
        ids
      )
      return selected
    },
    retrieveFromSource: function* (ids: ID[] | UnlistedTrackRequest[]) {
      let fetched: UserTrackMetadata[]
      if (canBeUnlisted) {
        const ids = trackIds as UnlistedTrackRequest[]
        // TODO: remove the AudiusBackend
        // branches here when we support
        // bulk track fetches in the API.
        if (ids.length > 1) {
          fetched = yield call(
            AudiusBackend.getTracksIncludingUnlisted,
            trackIds as UnlistedTrackRequest[]
          )
        } else {
          fetched = yield call(args => apiClient.getTrack(args), {
            id: ids[0].id,
            currentUserId,
            unlistedArgs: {
              urlTitle: ids[0].url_title,
              handle: ids[0].handle
            }
          })
        }
      } else {
        const ids = trackIds as number[]
        if (ids.length > 1) {
          fetched = yield call(AudiusBackend.getAllTracks, {
            offset: 0,
            limit: ids.length,
            idsArray: ids as ID[]
          })
        } else {
          fetched = yield call(args => apiClient.getTrack(args), {
            id: ids[0],
            currentUserId
          })
        }
      }
      return fetched
    },
    kind: Kind.TRACKS,
    idField: 'track_id',
    forceRetrieveFromSource: false,
    shouldSetLoading: true,
    deleteExistingEntry: false,
    onBeforeAddToCache: function* <T extends TrackMetadata>(tracks: T[]) {
      yield addUsersFromTracks(tracks)
      const checkedTracks = yield call(setTracksIsBlocked, tracks)
      return checkedTracks.map(reformat)
    }
  })

  return ids.map(id => tracks.entries[id]).filter(Boolean)
}
