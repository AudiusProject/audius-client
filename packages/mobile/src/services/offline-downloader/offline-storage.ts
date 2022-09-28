import path from 'path'

import type { Track } from '@audius/common'
import RNFS, { exists } from 'react-native-fs'

import { getCoverArtUri } from './offline-downloader'

export const downloadsRoot = path.join(RNFS.CachesDirectoryPath, 'downloads')

export const getPathFromRoot = (string: string) => {
  return string.replace(downloadsRoot, '~')
}

export const getLocalTrackRoot = (track: any) => {
  return path.join(downloadsRoot, `/tracks`)
}

// Track Json

export const getLocalTrackJsonPath = (track: Track) => {
  return path.join(getLocalTrackRoot(track), `${track.track_id}.json`)
}

// Cover Art

export const getLocalCoverArtPath = (track: Track): [string?, string?] => {
  const uri = getCoverArtUri(track)
  if (!uri) return []
  const fileName = getArtFileNameFromUri(uri)
  return [`${downloadsRoot}/tracks/${track.track_id}`, fileName]
}

export const getArtFileNameFromUri = (uri: string) => {
  return uri.split('/').slice(-1)[0]
}

// Audio

export const getLocalAudioPath = (track: Track): [string, string] => {
  // @ts-ignore route_id exists on track
  const fileName = `${track.route_id.replaceAll('/', '_')}.mp3`
  return [`${downloadsRoot}/tracks/${track.track_id}`, fileName]
}

export const isAudioAvailableOffline = async (track: Track) => {
  const fullFilePath = path.join(...getLocalAudioPath(track))
  return await exists(fullFilePath)
}

// Storage management

// Debugging method to clear all downloaded content
export const purgeAllDownloads = async () => {
  console.log(`Before purge:`)
  await readDirRec(downloadsRoot)
  await RNFS.unlink(downloadsRoot)
  await RNFS.mkdir(downloadsRoot)
  console.log(`After purge:`)
  await readDirRec(downloadsRoot)
}

// Debugging method to read cached files
export const readDirRec = async (path: string) => {
  const files = await RNFS.readDir(path)
  if (files.length === 0) {
    console.log(`${getPathFromRoot(path)} - empty`)
  }
  files.forEach((item) => {
    if (item.isFile()) {
      console.log(`${getPathFromRoot(item.path)} - ${item.size} bytes`)
    }
  })
  await Promise.all(
    files.map(async (item) => {
      if (item.isDirectory()) {
        await readDirRec(item.path)
      }
    })
  )
}
