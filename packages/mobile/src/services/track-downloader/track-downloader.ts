import { cacheTracksSelectors } from '@audius/common'
import RNFS from 'react-native-fs'

import { store } from 'app/store'
const { getTracks, getTrack } = cacheTracksSelectors

// import { apiClient } from '../audius-api-client'

export const downloadAnyOldTrack = () => {
  const tracks = getTracks(store.getState(), {})
  const firstTrackId = Object.keys(tracks).pop()
  return downloadTrack(firstTrackId)
}

export const downloadTrack = async (trackId) => {
  const track = getTrack(store.getState(), { id: trackId })
  const coverArtUri = track?._cover_art_sizes?.['150x150']
  const destinationPath = `${
    RNFS.CachesDirectoryPath
  }/${coverArtUri?.replaceAll('/', '_')}`
  console.log(coverArtUri)
  console.log(destinationPath)
  const downloadAction = coverArtUri
    ? RNFS.downloadFile({
        fromUrl: coverArtUri,
        toFile: destinationPath
      })
    : null
  const result = await downloadAction?.promise
  console.log(result)
  return result?.statusCode ?? null
}
