import path from 'path'

import type {
  Collection,
  CollectionMetadata,
  Track,
  User,
  UserMetadata,
  UserTrackMetadata
} from '@audius/common'
import { allSettled } from '@audius/common'
import RNFetchBlob from 'rn-fetch-blob'

import { store } from 'app/store'
import {
  removeCollection,
  unloadTrack
} from 'app/store/offline-downloads/slice'

import { DOWNLOAD_REASON_FAVORITES } from './offline-downloader'

const {
  fs: { dirs, exists, ls, mkdir, readFile, unlink, writeFile }
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
  user: User
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

// Special case for favorites which is not a real collection with metadata
export const writeFavoritesCollectionJson = async () => {
  const pathToWrite = getLocalCollectionDir(DOWNLOAD_REASON_FAVORITES)
  if (await exists(pathToWrite)) {
    await unlink(pathToWrite)
  }
  mkdirSafe(pathToWrite)
}

export const getCollectionJson = async (
  collectionId: string
): Promise<OfflineCollection> => {
  try {
    const collectionJson = await readFile(
      getLocalCollectionJsonPath(collectionId),
      'utf8'
    )
    return JSON.parse(collectionJson)
  } catch (e) {
    if (e instanceof SyntaxError) {
      purgeDownloadedCollection(collectionId)
    }
    return Promise.reject(e)
  }
}

export const getOfflineCollections = async () => {
  const collectionsDir = getLocalCollectionsRoot()
  if (!(await exists(collectionsDir))) {
    return []
  }
  return await ls(collectionsDir)
}

export const purgeDownloadedCollection = async (collectionId: string) => {
  const collectionDir = getLocalCollectionDir(collectionId)
  if (!(await exists(collectionDir))) return
  await unlink(collectionDir)
  store.dispatch(removeCollection({ collectionId, isFavoritesDownload: true }))
  store.dispatch(removeCollection({ collectionId, isFavoritesDownload: false }))
}

// Track Json

export const getLocalTrackJsonPath = (trackId: string) => {
  return path.join(getLocalTrackDir(trackId), `${trackId}.json`)
}

// Cover Art

export const getLocalCollectionCoverArtDestination = (
  collectionId: string,
  uri: string
) => {
  return path.join(getLocalCollectionDir(collectionId), IMAGE_FILENAME)
}

export const getLocalCollectionCoverArtPath = (collectionId: string) => {
  return path.join(getLocalCollectionDir(collectionId), IMAGE_FILENAME)
}

export const getLocalTrackCoverArtDestination = (
  trackId: string,
  uri: string
) => {
  return path.join(getLocalTrackDir(trackId), IMAGE_FILENAME)
}

export const getLocalTrackCoverArtPath = (trackId: string) => {
  return path.join(getLocalTrackDir(trackId), IMAGE_FILENAME)
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
  const tracksDir = getLocalTracksRoot()
  if (!(await exists(tracksDir))) {
    return []
  }
  return await ls(tracksDir)
}

export const getTrackJson = async (
  trackId: string
): Promise<Track & UserTrackMetadata> => {
  try {
    const trackJson = await readFile(getLocalTrackJsonPath(trackId), 'utf8')
    return JSON.parse(trackJson)
  } catch (e) {
    if (e instanceof SyntaxError) {
      purgeDownloadedTrack(trackId)
    }
    return Promise.reject(e)
  }
}

export const writeTrackJson = async (
  trackId: string,
  trackToWrite: UserTrackMetadata
) => {
  const pathToWrite = getLocalTrackJsonPath(trackId)
  if (await exists(pathToWrite)) {
    await unlink(pathToWrite)
  }
  await writeFile(pathToWrite, JSON.stringify(trackToWrite))
}

export const verifyTrack = async (
  trackId: string,
  expectTrue?: boolean
): Promise<boolean> => {
  const audioFile = exists(getLocalAudioPath(trackId))
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

export const purgeDownloadedTrack = async (trackId: string) => {
  const trackDir = getLocalTrackDir(trackId)
  if (!(await exists(trackDir))) return
  await unlink(trackDir)
  store.dispatch(unloadTrack(trackId))
}

/** Debugging method to read cached files */
export const readDirRec = async (path: string) => {
  const files = await readDir(path)
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

export const readDirRoot = async () => await readDirRec(downloadsRoot)

export const mkdirSafe = async (path: string) => {
  if (!(await exists(path))) {
    await mkdir(path)
  }
}
