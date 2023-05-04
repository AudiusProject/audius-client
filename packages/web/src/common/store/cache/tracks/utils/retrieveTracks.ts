import {
  ID,
  Kind,
  Track,
  TrackMetadata,
  UserTrackMetadata,
  accountSelectors,
  CommonState,
  getContext,
  cacheSelectors,
  cacheTracksSelectors,
  cacheTracksActions
} from '@audius/common'
import { call, put, select, spawn } from 'typed-redux-saga'

import { retrieve } from 'common/store/cache/sagas'
import { waitForRead } from 'utils/sagaHelpers'

import {
  fetchAndProcessRemixes,
  fetchAndProcessRemixParents
} from './fetchAndProcessRemixes'
import { fetchAndProcessStems } from './fetchAndProcessStems'
import { addUsersFromTracks } from './helpers'
import { reformat } from './reformat'
const { getEntryTimestamp } = cacheSelectors
const { getTracks: getTracksSelector } = cacheTracksSelectors
const { setPermalink } = cacheTracksActions
const getUserId = accountSelectors.getUserId

type RetrieveTracksArgs = {
  trackIds: ID[]
  withStems?: boolean
  withRemixes?: boolean
  withRemixParents?: boolean
  forceRetrieveFromSource?: boolean
}
type RetrieveTrackByHandleAndSlugArgs = {
  handle: string
  slug: string
  withStems?: boolean
  withRemixes?: boolean
  withRemixParents?: boolean
  forceRetrieveFromSource?: boolean
}

export function* retrieveTrackByHandleAndSlug({
  handle,
  slug,
  withStems,
  withRemixes,
  withRemixParents,
  forceRetrieveFromSource = false
}: RetrieveTrackByHandleAndSlugArgs) {
  const permalink = `/${handle}/${slug}`
  const tracks = (yield* call(
    // @ts-ignore retrieve should be refactored to ts first
    retrieve,
    {
      ids: [permalink],
      selectFromCache: function* (permalinks: string[]) {
        const track = yield* select(getTracksSelector, {
          permalinks
        })
        return track
      },
      retrieveFromSource: function* (permalinks: string[]) {
        yield* waitForRead()
        const apiClient = yield* getContext('apiClient')
        const userId = yield* select(getUserId)
        const track = yield* call((args) => {
          const split = args[0].split('/')
          const handle = split[1]
          const slug = split.slice(2).join('')
          return apiClient.getTrackByHandleAndSlug({
            handle,
            slug,
            currentUserId: userId
          })
        }, permalinks)
        return track
      },
      kind: Kind.TRACKS,
      idField: 'track_id',
      forceRetrieveFromSource,
      shouldSetLoading: true,
      deleteExistingEntry: false,
      getEntriesTimestamp: function* (ids: ID[]) {
        const selected = yield* select(
          (state: CommonState, ids: ID[]) =>
            ids.reduce((acc, id) => {
              acc[id] = getEntryTimestamp(state, { kind: Kind.TRACKS, id })
              return acc
            }, {} as { [id: number]: number | null }),
          ids
        )
        return selected
      },
      onBeforeAddToCache: function* (tracks: TrackMetadata[]) {
        const audiusBackendInstance = yield* getContext('audiusBackendInstance')
        yield* addUsersFromTracks(tracks)
        const [track] = tracks
        const isLegacyPermalink = track.permalink !== permalink
        if (isLegacyPermalink) {
          yield* put(setPermalink(permalink, track.track_id))
        }
        return tracks.map((track) => reformat(track, audiusBackendInstance))
      }
    }
  )) as { entries: { [permalink: string]: Track } }

  const track = tracks.entries[permalink]
  if (!track || !track.track_id) return null
  const trackId = track.track_id
  if (withStems) {
    yield* spawn(function* () {
      yield* call(fetchAndProcessStems, trackId)
    })
  }

  if (withRemixes) {
    yield* spawn(function* () {
      yield* call(fetchAndProcessRemixes, trackId)
    })
  }

  if (withRemixParents) {
    yield* spawn(function* () {
      yield* call(fetchAndProcessRemixParents, trackId)
    })
  }
  return track
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
  withRemixes = false,
  withRemixParents = false
}: RetrieveTracksArgs) {
  yield* waitForRead()
  const currentUserId = yield* select(getUserId)

  // In the case of unlisted tracks, trackIds contains metadata used to fetch tracks
  if (withRemixes) {
    yield* spawn(function* () {
      if (trackIds.length > 1) {
        console.warn('Remixes endpoint only supports fetching single tracks')
        return
      }
      const trackId = trackIds[0]
      if (!trackId) return
      yield* call(fetchAndProcessRemixes, trackId)
    })
  }

  if (withRemixParents) {
    yield* spawn(function* () {
      if (trackIds.length > 1) {
        console.warn(
          'Remix parents endpoint only supports fetching single tracks'
        )
        return
      }
      const trackId = trackIds[0]
      if (!trackId) return
      yield* call(fetchAndProcessRemixParents, trackId)
    })
  }

  // @ts-ignore retrieve should be refactored to ts first
  const tracks: { entries: { [id: number]: Track } } = yield* call(retrieve, {
    ids: trackIds,
    selectFromCache: function* (ids: ID[]) {
      return yield* select(getTracksSelector, { ids })
    },
    getEntriesTimestamp: function* (ids: ID[]) {
      const selected = yield* select(
        (state: CommonState, ids: ID[]) =>
          ids.reduce((acc, id) => {
            acc[id] = getEntryTimestamp(state, { kind: Kind.TRACKS, id })
            return acc
          }, {} as { [id: number]: number | null }),
        ids
      )
      return selected
    },
    retrieveFromSource: function* (ids: ID[]) {
      yield* waitForRead()
      const apiClient = yield* getContext('apiClient')
      let fetched: UserTrackMetadata | UserTrackMetadata[] | null | undefined
      if (ids.length > 1) {
        fetched = yield* call([apiClient, 'getTracks'], {
          ids,
          currentUserId
        })
      } else {
        fetched = yield* call([apiClient, 'getTrack'], {
          id: ids[0],
          currentUserId
        })
      }
      return fetched
    },
    kind: Kind.TRACKS,
    idField: 'track_id',
    forceRetrieveFromSource: false,
    shouldSetLoading: true,
    deleteExistingEntry: false,
    onBeforeAddToCache: function* <T extends TrackMetadata>(tracks: T[]) {
      const audiusBackendInstance = yield* getContext('audiusBackendInstance')
      yield* addUsersFromTracks(tracks)
      return tracks.map((track) => reformat(track, audiusBackendInstance))
    }
  })

  return trackIds.map((id) => tracks.entries[id]).filter(Boolean)
}
