import path from 'path'

import type {
  DownloadReason,
  Track,
  UserMetadata,
  UserTrackMetadata
} from '@audius/common'
import {
  cacheCollectionsSelectors,
  Kind,
  makeUid,
  DefaultSizes,
  SquareSizes,
  encodeHashId,
  accountSelectors
} from '@audius/common'
import { uniq, isEqual } from 'lodash'
import RNFS, { exists } from 'react-native-fs'

import type { TrackForDownload } from 'app/components/offline-downloads'
import { store } from 'app/store'
import {
  addCollection,
  batchStartDownload,
  startDownload,
  completeDownload,
  errorDownload,
  loadTrack,
  removeCollection
} from 'app/store/offline-downloads/slice'

import { apiClient } from '../audius-api-client'
import { audiusBackendInstance } from '../audius-backend-instance'

import type { TrackDownloadWorkerPayload } from './offline-download-queue'
import { enqueueTrackDownload } from './offline-download-queue'
import {
  getLocalAudioPath,
  getLocalCoverArtDestination,
  getLocalTrackJsonPath,
  purgeDownloadedTrack,
  getTrackJson,
  verifyTrack,
  writeTrackJson,
  writeCollectionJson,
  writeFavoritesCollectionJson,
  purgeDownloadedCollection
} from './offline-storage'
const { getUserId } = accountSelectors
const { getCollection } = cacheCollectionsSelectors

export const DOWNLOAD_REASON_FAVORITES = 'favorites'

/** Main entrypoint - perform all steps required to complete a download for each track */
export const downloadCollection = async (
  collectionId: number,
  tracksForDownload: TrackForDownload[]
) => {
  const state = store.getState()
  const collection = getCollection(state, { id: collectionId })
  const collectionIdStr = collectionId.toString()
  const isFavoritesDownload = collectionIdStr !== DOWNLOAD_REASON_FAVORITES
  if (!collection && !isFavoritesDownload) return
  isFavoritesDownload
    ? await writeFavoritesCollectionJson()
    : await writeCollectionJson(collectionIdStr, collection!)
  store.dispatch(addCollection(collectionIdStr))
  store.dispatch(
    batchStartDownload(
      tracksForDownload.map(({ trackId }) => trackId.toString())
    )
  )
  tracksForDownload.forEach((trackForDownload) =>
    enqueueTrackDownload(trackForDownload, collectionIdStr)
  )
}

const populateCoverArtSizes = async (track: UserTrackMetadata & Track) => {
  if (!track || !track.user || (!track.cover_art_sizes && !track.cover_art))
    return
  const gateways = audiusBackendInstance.getCreatorNodeIPFSGateways(
    track.user.creator_node_endpoint
  )
  const multihash = track.cover_art_sizes || track.cover_art
  if (!multihash) return track
  await Promise.allSettled(
    Object.values(SquareSizes).map(async (size) => {
      const coverArtSize = multihash === track.cover_art_sizes ? size : null
      const url = await audiusBackendInstance.getImageUrl(
        multihash,
        coverArtSize,
        gateways
      )
      track._cover_art_sizes = {
        ...track._cover_art_sizes,
        [coverArtSize || DefaultSizes.OVERRIDE]: url
      }
    })
  )
  return track
}

export const downloadTrack = async ({
  trackForDownload,
  collection
}: TrackDownloadWorkerPayload) => {
  const { trackId, downloadReason } = trackForDownload
  const trackIdStr = trackId.toString()

  // Throw this
  const failJob = (message?: string) => {
    store.dispatch(errorDownload(trackIdStr))
    return new Error(message)
  }

  // @ts-ignore mismatch in an irrelevant part of state
  const state = store.getState() as CommonState
  const currentUserId = getUserId(state)

  let track: (UserTrackMetadata & Track) | undefined = await apiClient.getTrack(
    {
      id: trackId,
      currentUserId
    }
  )

  if (!track) {
    throw failJob(`track to download not found on discovery - ${trackIdStr}`)
  }
  if (
    track?.is_delete ||
    (track?.is_unlisted && currentUserId !== track.user.user_id)
  ) {
    throw failJob(`track to download is not available - ${trackIdStr}`)
  }

  track = (await populateCoverArtSizes(track)) ?? track
  const lineupTrack = {
    uid: makeUid(Kind.TRACKS, track.track_id),
    ...track
  }

  try {
    store.dispatch(startDownload(trackIdStr))
    if (await verifyTrack(trackIdStr, false)) {
      // Track is already downloaded, so rewrite the json
      // to include this collection in the reasons_for_download list
      const trackJson = await getTrackJson(trackIdStr)
      const trackToWrite: UserTrackMetadata = {
        ...trackJson,
        offline: {
          download_completed_time:
            trackJson.offline?.download_completed_time ?? Date.now(),
          last_verified_time:
            trackJson.offline?.last_verified_time ?? Date.now(),
          reasons_for_download: trackJson.offline?.reasons_for_download?.concat(
            downloadReason
          ) ?? [downloadReason]
        }
      }
      await writeTrackJson(trackIdStr, trackToWrite)
      store.dispatch(loadTrack(lineupTrack))
      store.dispatch(completeDownload(trackIdStr))
      return
    }

    await downloadCoverArt(track)
    await tryDownloadTrackFromEachCreatorNode(track)
    await writeUserTrackJson(track, downloadReason)
    const verified = await verifyTrack(trackIdStr, true)
    if (verified) {
      store.dispatch(loadTrack(lineupTrack))
      store.dispatch(completeDownload(trackIdStr))
    } else {
      throw failJob(
        `DownloadQueueWorker - download verification failed ${trackIdStr}`
      )
    }
    return verified
  } catch (e) {
    throw failJob(e.message)
  }
}

export const removeCollectionDownload = async (
  collectionId: string,
  tracksForDownload: TrackForDownload[]
) => {
  purgeDownloadedCollection(collectionId)
  tracksForDownload.forEach(async ({ trackId, downloadReason }) => {
    try {
      const trackIdStr = trackId.toString()
      const diskTrack = await getTrackJson(trackIdStr)
      const downloadReasons = diskTrack.offline?.reasons_for_download ?? []
      const remainingReasons = downloadReasons.filter(
        (reason) => !isEqual(reason, downloadReason)
      )
      if (remainingReasons.length === 0) {
        purgeDownloadedTrack(trackIdStr)
      } else {
        const trackToWrite = {
          ...diskTrack,
          offline: {
            download_completed_time:
              diskTrack.offline?.download_completed_time ?? Date.now(),
            last_verified_time:
              diskTrack.offline?.last_verified_time ?? Date.now(),
            reasons_for_download: remainingReasons
          }
        }
        await writeTrackJson(trackIdStr, trackToWrite)
      }
    } catch (e) {
      console.debug(
        `failed to remove track ${trackId} from collection ${collectionId}`
      )
    }
  })
}

/** Unlike mp3 and album art, here we overwrite even if the file exists to ensure we have the latest */
export const writeUserTrackJson = async (
  track: UserTrackMetadata,
  downloadReason: DownloadReason
) => {
  const trackToWrite: UserTrackMetadata = {
    ...track,
    offline: {
      reasons_for_download: uniq([
        downloadReason,
        ...(track?.offline?.reasons_for_download ?? [])
      ]),
      download_completed_time: Date.now(),
      last_verified_time: Date.now()
    }
  }

  const pathToWrite = getLocalTrackJsonPath(track.track_id.toString())
  if (await exists(pathToWrite)) {
    await RNFS.unlink(pathToWrite)
  }
  await RNFS.write(pathToWrite, JSON.stringify(trackToWrite))
}

export const downloadCoverArt = async (track: Track) => {
  const coverArtUris = Object.values(track._cover_art_sizes)
  await Promise.all(
    coverArtUris.map(async (coverArtUri) => {
      const destination = getLocalCoverArtDestination(
        track.track_id.toString(),
        coverArtUri
      )
      await downloadIfNotExists(coverArtUri, destination)
    })
  )
}

export const tryDownloadTrackFromEachCreatorNode = async (track: Track) => {
  const state = store.getState()
  const user = (
    await apiClient.getUser({
      userId: track?.owner_id,
      // @ts-ignore mismatch in an irrelevant part of state
      currentUserId: getUserId(state)
    })
  )[0] as UserMetadata
  const encodedTrackId = encodeHashId(track.track_id)
  const creatorNodeEndpoints = user.creator_node_endpoint.split(',')
  const destination = getLocalAudioPath(track.track_id.toString())

  for (const creatorNodeEndpoint of creatorNodeEndpoints) {
    const uri = `${creatorNodeEndpoint}/tracks/stream/${encodedTrackId}`
    const statusCode = await downloadIfNotExists(uri, destination)
    if (statusCode) {
      return statusCode
    }
  }
}

/** Dowanload file at uri to destination unless there is already a file at that location or overwrite is true */
const downloadIfNotExists = async (
  uri: string,
  destination: string,
  overwrite?: boolean
) => {
  if (!uri || !destination) return null
  if (!overwrite && (await exists(destination))) {
    return null
  }

  const destinationDirectory = path.dirname(destination)
  await RNFS.mkdir(destinationDirectory)

  const result = await RNFS.downloadFile({
    fromUrl: uri,
    toFile: destination
  })?.promise

  return result?.statusCode ?? null
}
