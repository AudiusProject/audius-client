import type {
  ID,
  Track,
  TrackMetadata,
  UserTrackMetadata
} from '@audius/common'
import {
  encodeHashId,
  accountSelectors,
  getContext,
  reachabilityActions
} from '@audius/common'
import { CANCEL } from 'redux-saga'
import RNFetchBlob from 'rn-fetch-blob'
import { select, call, put, all, take, race } from 'typed-redux-saga'

import {
  downloadTrackCoverArt,
  getLocalAudioPath,
  getLocalTrackDir,
  writeTrackJson
} from 'app/services/offline-downloader'

import { getTrackOfflineDownloadStatus } from '../../../selectors'
import {
  cancelDownload,
  completeDownload,
  requestDownloadQueuedItem,
  errorDownload,
  OfflineDownloadStatus,
  removeOfflineItems,
  startDownload
} from '../../../slice'
const { SET_UNREACHABLE } = reachabilityActions

const { getUserId } = accountSelectors

function* shouldCancelDownload(trackId: ID) {
  while (true) {
    yield* take(removeOfflineItems.type)
    const trackStatus = yield* select(getTrackOfflineDownloadStatus(trackId))
    if (!trackStatus) return true
  }
}

export function* downloadTrackWorker(trackId: ID) {
  yield* put(startDownload({ type: 'track', id: trackId }))

  const { downloadTrack, unreachable, cancel } = yield* race({
    downloadTrack: call(downloadTrackAsync, trackId),
    cancel: call(shouldCancelDownload, trackId),
    unreachable: take(SET_UNREACHABLE)
  })

  if (cancel) {
    yield* call(removeDownloadedTrack, trackId)
    yield* put(requestDownloadQueuedItem())
  } else if (unreachable) {
    yield* put(cancelDownload({ type: 'track', id: trackId }))
    yield* call(removeDownloadedTrack, trackId)
  } else if (downloadTrack === OfflineDownloadStatus.ERROR) {
    yield* put(errorDownload({ type: 'track', id: trackId }))
    yield* call(removeDownloadedTrack, trackId)
    yield* put(requestDownloadQueuedItem())
  } else if (downloadTrack === OfflineDownloadStatus.SUCCESS) {
    yield* put(
      completeDownload({ type: 'track', id: trackId, completedAt: Date.now() })
    )
    yield* put(requestDownloadQueuedItem())
  }
}

function* downloadTrackAsync(
  trackId: ID
): Generator<any, OfflineDownloadStatus> {
  const currentUserId = yield* select(getUserId)
  const apiClient = yield* getContext('apiClient')

  const track = yield* call([apiClient, apiClient.getTrack], {
    id: trackId,
    currentUserId,
    abortOnUnreachable: false
  })

  if (
    !track ||
    track.is_delete ||
    (track.is_unlisted && currentUserId !== track.user.user_id)
  ) {
    return OfflineDownloadStatus.ERROR
  }

  const trackMetadata: Track & UserTrackMetadata = {
    ...track,
    // Empty cover art sizes because the images are stored locally
    _cover_art_sizes: {}
  }

  try {
    yield* all([
      call(downloadTrackCoverArt, track),
      call(downloadTrackAudio, track)
    ])

    yield* call(writeTrackJson, trackId.toString(), trackMetadata)
  } catch (e) {
    return OfflineDownloadStatus.ERROR
  }

  return OfflineDownloadStatus.SUCCESS
}

function* downloadTrackAudio(track: TrackMetadata) {
  const { owner_id, track_id } = track
  const currentUserId = yield* select(getUserId)
  const apiClient = yield* getContext('apiClient')
  const [trackOwner] = yield* call([apiClient, apiClient.getUser], {
    userId: owner_id,
    currentUserId,
    abortOnUnreachable: false
  })

  if (!trackOwner) throw new Error('Unable to fetch track owner')

  const { creator_node_endpoint } = trackOwner
  const creatorNodeEndpoints = creator_node_endpoint?.split(',')
  if (!creatorNodeEndpoints) throw new Error('No creator node endpoints')

  const trackFilePath = getLocalAudioPath(track_id)
  const encodedTrackId = encodeHashId(track_id)

  for (const creatorNodeEndpoint of creatorNodeEndpoints) {
    const trackAudioUri = `${creatorNodeEndpoint}/tracks/stream/${encodedTrackId}`
    const response = yield* call(downloadFile, trackAudioUri, trackFilePath)
    if (response.info().status === 200) {
      return
    }
  }

  throw new Error('Unable to download track audio')
}

function downloadFile(uri: string, destination: string) {
  const { fetch } = RNFetchBlob.config({ path: destination })
  const fetchTask = fetch('GET', uri)
  fetchTask[CANCEL] = fetchTask.cancel
  return fetchTask
}

async function removeDownloadedTrack(trackId: ID) {
  const trackDir = getLocalTrackDir(trackId.toString())
  return await RNFetchBlob.fs.unlink(trackDir)
}
