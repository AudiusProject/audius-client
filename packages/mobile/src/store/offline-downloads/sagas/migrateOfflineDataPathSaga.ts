import path from 'path'

import moment from 'moment'
import RNFS from 'react-native-fs'
import RNFetchBlob from 'rn-fetch-blob'
import { call } from 'typed-redux-saga'

import { downloadsRoot } from 'app/services/offline-downloader'

import { getIsOfflineEnabled } from './getIsOfflineEnabled'

// Copy util

const {
  fs: { dirs, unlink, exists }
} = RNFetchBlob

const legacyDownloadsRoot = path.join(dirs.DocumentDir, 'downloads')

// Move downloads from legacy storage location to the updated path (currently: /Documents -> /Caches)
export function* migrateOfflineDataPathSaga() {
  const isOfflineModeEnabled = yield* call(getIsOfflineEnabled)
  if (!isOfflineModeEnabled) return

  const legacyFilesExist = yield* call(exists, legacyDownloadsRoot)
  if (!legacyFilesExist) return // TODO: fire action?

  const start = moment()
  yield* call(copyRecursive, legacyDownloadsRoot, downloadsRoot)
  yield* call(unlink, legacyDownloadsRoot)
  const end = moment()
  const duration = end.diff(start)
  console.log('Migration duration', duration)
}

async function copyRecursive(source: string, destination: string) {
  console.log(`${source} => ${destination}`)
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
