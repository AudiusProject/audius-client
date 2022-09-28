import path from 'path'

import type { Track, UserMetadata } from '@audius/common'
import {
  encodeHashId,
  accountSelectors,
  cacheTracksSelectors
} from '@audius/common'
import { uniq } from 'lodash'
import RNFS, { exists } from 'react-native-fs'

import { store } from 'app/store'

import { apiClient } from '../audius-api-client'

import {
  getLocalAudioPath,
  getLocalCoverArtPath,
  getLocalTrackJsonPath
} from './offline-storage'
const { getUserId } = accountSelectors
const { getTrack } = cacheTracksSelectors

// Main entrypoint - perform all steps required to complete a download
export const downloadTrack = async (trackId: number, collection: string) => {
  const state = store.getState()
  const track = getTrack(state, { id: trackId })
  if (!track) return false

  const coverArtUri = getCoverArtUri(track)
  const [coverArtDirectory, coverArtFileName] = getLocalCoverArtPath(track)
  if (coverArtUri && coverArtDirectory && coverArtFileName) {
    await downloadIfNotExists(coverArtUri, coverArtDirectory, coverArtFileName)
  }
  await tryDownloadTrackFromEachCreatorNode(track)
  await writeTrackJson(track, collection)
}

// Unlike mp3 and album art, here we overwrite even if the file exists to ensure we have the latest
const writeTrackJson = async (track: Track, collection: string) => {
  const trackToWrite: Track = {
    ...track,
    offline: {
      downloaded_from_collection: uniq([
        collection,
        ...(track?.offline?.downloaded_from_collection ?? [])
      ]),
      download_completed_time: Date.now(),
      last_verified_time: Date.now()
    }
  }

  const pathToWrite = getLocalTrackJsonPath(track)
  await RNFS.write(pathToWrite, JSON.stringify(trackToWrite))
}

const tryDownloadTrackFromEachCreatorNode = async (track: Track) => {
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
  for (const creatorNodeEndpoint of creatorNodeEndpoints) {
    const uri = `${creatorNodeEndpoint}/tracks/stream/${encodedTrackId}`
    const [audioDirectory, audioFileName] = getLocalAudioPath(track)
    if (audioDirectory && audioFileName) {
      await downloadIfNotExists(uri, audioDirectory, audioFileName)
    }
  }
}

export const getCoverArtUri = (track: Track) => {
  // TODO: get other sizes
  return track._cover_art_sizes?.['150x150']
}

const downloadIfNotExists = async (
  uri: string,
  destinationDirectory: string,
  fileName: string,
  overwrite?: boolean
) => {
  if (!uri) return null
  const fullFilePath = path.join(destinationDirectory, fileName)
  if (!overwrite && (await exists(fullFilePath))) {
    return null
  }

  await RNFS.mkdir(destinationDirectory)

  const result = await RNFS.downloadFile({
    fromUrl: uri,
    toFile: fullFilePath
  })?.promise

  return result?.statusCode ?? null
}
