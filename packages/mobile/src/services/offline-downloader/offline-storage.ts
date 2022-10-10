import path from 'path'

import type { Track } from '@audius/common'
import RNFS, { exists, readDir, readFile } from 'react-native-fs'
import { track } from '../analytics'

export const downloadsRoot = path.join(RNFS.CachesDirectoryPath, 'downloads')

export const getPathFromRoot = (string: string) => {
  return string.replace(downloadsRoot, '~')
}

export const getLocalTracksRoot = () => {
  return path.join(downloadsRoot, `/tracks`)
}

export const getLocalTrackDir = (trackId: string): string => {
  return path.join(getLocalTracksRoot(), trackId)
}

// Track Json

export const getLocalTrackJsonPath = (trackId: string) => {
  return path.join(getLocalTrackDir(trackId), `${trackId}.json`)
}

// Cover Art

export const getLocalCoverArtPath = (trackId: string, uri: string) => {
  return path.join(getLocalTrackDir(trackId), getArtFileNameFromUri(uri))
}

export const getArtFileNameFromUri = (uri: string) => {
  // This should be "150x150.jpg" or similar
  return uri.split('/').slice(-1)[0]
}

// Audio

export const getLocalAudioPath = (trackId: string): string => {
  return path.join(getLocalTrackDir(trackId), `${trackId}.mp3`)
}

export const isAudioAvailableOffline = async (trackId: string) => {
  return await exists(getLocalAudioPath(trackId))
}

// Storage management

export const listTracks = async (): Promise<string[]> => {
  const files = await readDir(getLocalTracksRoot())
  return files.filter((file) => file.isDirectory).map((file) => file.name)
}

export const getTrackJson = async (trackId: string): Promise<Track> => {
  return JSON.parse(await readFile(getLocalTrackJsonPath(trackId))) as Track
}

export const verifyTrack = async (track: Track): Promise<boolean> => {
  const trackId = track.track_id.toString()
  const audioFile = exists(getLocalAudioPath(trackId))
  // TODO: check for all required art
  const artFile = exists(path.join(getLocalTrackDir(trackId), '150x150.jpg'))
  const jsonFile = exists(getLocalTrackJsonPath(trackId))

  const results = await Promise.all([audioFile, artFile, jsonFile])
  const [audioExists, artExists, jsonExists] = results

  !audioExists && console.warn(`Missing audio for ${trackId}`)
  !artExists && console.warn(`Missing art for ${trackId}`)
  !jsonExists && console.warn(`Missing json for ${trackId}`)

  return results.every((exists) => exists)
}

/** Debugging method to clear all downloaded content */
export const purgeAllDownloads = async () => {
  console.log(`Before purge:`)
  await readDirRec(downloadsRoot)
  await RNFS.unlink(downloadsRoot)
  await RNFS.mkdir(downloadsRoot)
  console.log(`After purge:`)
  await readDirRec(downloadsRoot)
}

/** Debugging method to read cached files */
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
