import path from 'path'

import type {
  Collection,
  CollectionMetadata,
  ID,
  Nullable,
  Track,
  UserMetadata,
  UserTrackMetadata
} from '@audius/common'
import { allSettled } from '@audius/common'
import RNFetchBlob from 'rn-fetch-blob'

const {
  fs: { dirs, exists, ls, lstat, mkdir, readFile, unlink, writeFile }
} = RNFetchBlob

export type OfflineCollection = Collection & { user: UserMetadata }

export const downloadsRoot = path.join(dirs.CacheDir, 'downloads')
const IMAGE_FILENAME = '1000x1000.jpg'

export const getPathFromRoot = (string: string) => {
  return string.replace(downloadsRoot, '~')
}

export const getLocalCollectionsRoot = () => {
  return path.join(downloadsRoot, `/collections`)
}

export const getLocalCollectionDir = (collectionId: string): string => {
  return path.join(getLocalCollectionsRoot(), collectionId)
}

export const getLocalTracksRoot = () => {
  return path.join(downloadsRoot, `/tracks`)
}

export const getLocalTrackDir = (trackId: string): string => {
  return path.join(getLocalTracksRoot(), trackId)
}

// Collections

export const getLocalCollectionJsonPath = (collectionId: string) => {
  return path.join(getLocalCollectionDir(collectionId), `${collectionId}.json`)
}

export const writeCollectionJson = async (
  collectionId: string,
  collectionToWrite: CollectionMetadata,
  user: UserMetadata
) => {
  const pathToWrite = getLocalCollectionJsonPath(collectionId)
  if (await exists(pathToWrite)) {
    await unlink(pathToWrite)
  }
  await mkdirSafe(getLocalCollectionDir(collectionId))
  await writeFile(
    pathToWrite,
    JSON.stringify({
      ...collectionToWrite,
      user
    })
  )
}

export const getCollectionJson = async (
  collectionId: string
): Promise<Nullable<OfflineCollection>> => {
  try {
    const isVerified = await verifyCollection(collectionId)
    if (!isVerified) return null

    const collectionJson = await readFile(
      getLocalCollectionJsonPath(collectionId),
      'utf8'
    )
    return JSON.parse(collectionJson)
  } catch (e) {
    return null
  }
}

export const getOfflineCollections = async () => {
  const collectionsDir = getLocalCollectionsRoot()
  if (!(await exists(collectionsDir))) {
    return []
  }
  return await ls(collectionsDir)
}

// Track Json

export const getLocalTrackJsonPath = (trackId: string) => {
  return path.join(getLocalTrackDir(trackId), `${trackId}.json`)
}

// Cover Art

export const getCollectionCoverArtPath = (collectionId: ID) => {
  return path.join(
    getLocalCollectionDir(collectionId.toString()),
    IMAGE_FILENAME
  )
}

export const getLocalCollectionCoverArtPath = (collectionId: string) => {
  return path.join(getLocalCollectionDir(collectionId), IMAGE_FILENAME)
}

export const getLocalTrackCoverArtDestination = (trackId: ID) => {
  return path.join(getLocalTrackDir(trackId.toString()), IMAGE_FILENAME)
}

export const getLocalTrackCoverArtPath = (trackId: string) => {
  return path.join(getLocalTrackDir(trackId), IMAGE_FILENAME)
}

// Audio

export const getLocalAudioPath = (trackId: ID): string => {
  return path.join(getLocalTrackDir(trackId.toString()), `${trackId}.mp3`)
}

// Storage management

export const listTracks = async (): Promise<string[]> => {
  const tracksDir = getLocalTracksRoot()
  if (!(await exists(tracksDir))) {
    return []
  }
  return await ls(tracksDir)
}

export const getTrackJson = async (
  trackId: string
): Promise<Nullable<Track & UserTrackMetadata>> => {
  try {
    const isVerified = await verifyTrack(trackId)
    if (!isVerified) return null

    const trackJson = await readFile(getLocalTrackJsonPath(trackId), 'utf8')
    return JSON.parse(trackJson)
  } catch (e) {
    return null
  }
}

// TODO: Update this to verify that the JSON can be parsed properly?
export const verifyTrack = async (
  trackId: string,
  expectTrue?: boolean
): Promise<boolean> => {
  const audioFile = exists(getLocalAudioPath(parseInt(trackId, 10)))
  const jsonFile = exists(getLocalTrackJsonPath(trackId))
  const artFile = exists(path.join(getLocalTrackDir(trackId), IMAGE_FILENAME))

  const results = await allSettled([audioFile, jsonFile, artFile])
  const booleanResults = results.map(
    (result) => result.status === 'fulfilled' && !!result.value
  )
  const [audioExists, jsonExists, artExists] = booleanResults

  if (expectTrue) {
    !audioExists && console.warn(`Missing audio for ${trackId}`)
    !jsonExists && console.warn(`Missing json for ${trackId}`)
    !artExists && console.warn(`Missing art for ${trackId}`)
  }

  return booleanResults.every((result) => result)
}

// TODO: Update this to verify that the JSON can be parsed properly?
export const verifyCollection = async (
  collectionId: string,
  expectTrue?: boolean
) => {
  const artFile = exists(getLocalCollectionCoverArtPath(collectionId))
  const jsonFile = exists(getLocalCollectionJsonPath(collectionId))

  const results = await allSettled([artFile, jsonFile])
  const booleanResults = results.map(
    (result) => result.status === 'fulfilled' && !!result.value
  )
  const [artExists, jsonExists] = booleanResults

  if (expectTrue) {
    !artExists && console.warn(`Missing art for ${collectionId}`)
    !jsonExists && console.warn(`Missing json for ${collectionId}`)
  }

  return booleanResults.every((result) => result)
}

export const purgeAllDownloads = async (withLogs?: boolean) => {
  if (await exists(downloadsRoot)) {
    if (withLogs) {
      console.log(`Before purge:`)
    }
    await readDirRec(downloadsRoot)
    await unlink(downloadsRoot)
    await mkdirSafe(downloadsRoot)
    if (withLogs) {
      console.log(`After purge:`)
    }
    await readDirRec(downloadsRoot)
  }
}

/** Debugging method to read cached files */
export const readDirRec = async (path: string) => {
  const files = await lstat(path)
  if (files.length === 0) {
    console.log(`${getPathFromRoot(path)} - empty`)
  }
  files.forEach((item) => {
    if (item.type === 'file') {
      console.log(`${getPathFromRoot(item.path)} - ${item.size} bytes`)
    }
  })
  await Promise.all(
    files.map(async (item) => {
      if (item.type === 'directory') {
        await readDirRec(item.path)
      }
    })
  )
}

export const readDirRoot = async () => await readDirRec(downloadsRoot)

export const mkdirSafe = async (path: string) => {
  if (!(await exists(path))) {
    return await mkdir(path)
  }
}
