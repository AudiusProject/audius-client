import path from 'path'

import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { call } from 'typed-redux-saga'

import { downloadsRoot } from 'app/services/offline-downloader'

import { getIsOfflineEnabled } from './getIsOfflineEnabled'

const {
  fs: { dirs, unlink, exists }
} = RNFetchBlob

// Current migration: 4/3/2023
// dirs.DocumentDir -> dirs.CacheDir
const legacyDownloadsRoot = path.join(dirs.DocumentDir, 'downloads')

// Move downloads from legacy storage location to the updated path (currently: /Documents -> /Caches)
export function* migrateOfflineDataPathSaga() {
  const isOfflineModeEnabled = yield* call(getIsOfflineEnabled)
  if (!isOfflineModeEnabled) return

  const legacyFilesExist = yield* call(exists, legacyDownloadsRoot)
  if (!legacyFilesExist) return // TODO: fire action?

  try {
    yield* call(copyRecursive, legacyDownloadsRoot, downloadsRoot)
  } finally {
    // If we fail, nuke the legacy directory to ensure we don't retry the process on every startup
    yield* call(unlink, legacyDownloadsRoot)
  }
}

// Util to recursively copy a directory since neither RNFS or rn-fetch-blob come with one
async function copyRecursive(source: string, destination: string) {
  // reads items from source directory
  const items = await RNFS.readDir(source)

  // creates destination directory
  if (!(await RNFS.exists(destination))) {
    await RNFS.mkdir(destination)
  }

  await Promise.all(
    items.map(async (item) => {
      //  item is a file
      if (item.isFile() === true) {
        const destinationFile = destination + '/' + item.name

        if (!(await exists(destinationFile))) {
          await RNFS.moveFile(item.path, destinationFile)
        }
      } else {
        // item is a directory
        const subDirectory = source + '/' + item.name
        const subDestinationDirectory = destination + '/' + item.name

        await copyRecursive(subDirectory, subDestinationDirectory)
      }
    })
  )
}
