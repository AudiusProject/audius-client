import type { Track, UserMetadata } from '@audius/common'
import {
  encodeHashId,
  accountSelectors,
  cacheTracksSelectors
} from '@audius/common'
import RNFS, { exists } from 'react-native-fs'

import { store } from 'app/store'

import { apiClient } from '../audius-api-client'
const { getUserId } = accountSelectors
const { getTracks, getTrack } = cacheTracksSelectors

// TODO: make this CachesDirectoryPath, but Downloads is easier to test with
// export const downloadsRoot = RNFS.CachesDirectoryPath
export const downloadsRoot = RNFS.CachesDirectoryPath

export const downloadAnyOldTrack = () => {
  const tracks = getTracks(store.getState(), {})
  const firstTrackId = Object.values(tracks)[1]?.track_id
  if (!firstTrackId) return
  return downloadTrack(firstTrackId)
}

export const downloadTrack = async (trackId: number) => {
  const state = store.getState()
  const track = getTrack(state, { id: trackId })
  if (!track) return false

  const coverArtUri = getCoverArtUri(track)
  const [coverArtDirectory, coverArtFileName] = getCoverArtDestination(track)
  if (coverArtUri && coverArtDirectory && coverArtFileName) {
    await downloadIfNotExists(coverArtUri, coverArtDirectory, coverArtFileName)
  }
  await tryDownloadTrackFromEachCreatorNode(track)
}

const tryDownloadTrackFromEachCreatorNode = async (track: Track) => {
  const state = store.getState()
  const user = (
    await apiClient.getUser({
      userId: track?.owner_id,
      currentUserId: getUserId(state as any) // todo
    })
  )[0] as UserMetadata
  console.log(user)
  const encodedTrackId = encodeHashId(track.track_id)
  const creatorNodeEndpoints = user.creator_node_endpoint.split(',')
  for (const creatorNodeEndpoint of creatorNodeEndpoints) {
    const uri = `${creatorNodeEndpoint}/tracks/stream/${encodedTrackId}`
    const [audioDirectory, audioFileName] = getAudioDestination(track)
    await downloadIfNotExists(uri, audioDirectory, audioFileName)
  }
}

const getCoverArtUri = (track: Track) => {
  return track._cover_art_sizes?.['150x150']
}

const getCoverArtDestination = (track: Track) => {
  const uri = getCoverArtUri(track)
  if (!uri) return [null, null]
  const fileName = getFileNameFromUri(uri)
  return [`${downloadsRoot}/tracks/${track.track_id}`, fileName]
}

// TODO: why isn't route id on the type, even though it's populated in state
const getAudioDestination = (track) => {
  const fileName = `${track.route_id.replaceAll('/', '_')}.mp3`
  return [`${downloadsRoot}/tracks/${track.track_id}`, fileName]
}

const getFileNameFromUri = (uri: string) => {
  return uri.split('/').slice(-1)[0]
}

const downloadIfNotExists = async (
  uri: string,
  destinationDirectory: string,
  fileName: string,
  overwrite?: boolean
) => {
  if (!uri) return null
  const fullFilePath = `${destinationDirectory}/${fileName}`
  if (!overwrite && (await exists(fullFilePath))) {
    console.log(`file at ${fullFilePath} exists`)
    return null
  }

  await RNFS.mkdir(destinationDirectory)

  const result = await RNFS.downloadFile({
    fromUrl: uri,
    toFile: fullFilePath
  })?.promise

  console.log(result)
  return result?.statusCode ?? null
}
