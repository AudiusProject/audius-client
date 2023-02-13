import path from 'path'

import type { UserCollectionMetadata, UserTrackMetadata } from '@audius/common'
import { SquareSizes } from '@audius/common'
import RNFetchBlob from 'rn-fetch-blob'

import { createAllImageSources } from 'app/hooks/useContentNodeImage'

import {
  getLocalTrackCoverArtDestination,
  getLocalCollectionCoverArtDestination,
  mkdirSafe
} from './offline-storage'

export const DOWNLOAD_REASON_FAVORITES = 'favorites'

const downloadCoverArt =
  <T extends UserTrackMetadata | UserCollectionMetadata>(
    getDestination: (entity: T, uri: string) => string
  ) =>
  async (entity: T) => {
    const cid = entity ? entity.cover_art_sizes || entity.cover_art : null

    const imageSources = createAllImageSources({
      cid,
      user: entity.user,
      // Only download the largest image
      size: SquareSizes.SIZE_1000_BY_1000
    })

    const coverArtUris = imageSources
      .map(({ uri }) => uri)
      .filter((uri): uri is string => !!uri)

    const downloadImage = async (uris: string[]) => {
      if (!uris.length) {
        return
      }
      const uri = uris[0]

      const destination = getDestination(entity, uri)

      const response = await downloadFile(uri, destination)
      if (response !== 200) {
        await downloadImage(uris.slice(1))
      }
    }

    await downloadImage(coverArtUris)
  }

const getTrackArtDestination = (entity: UserTrackMetadata, uri: string) =>
  getLocalTrackCoverArtDestination(entity.track_id.toString(), uri)

const getCollectionArtDestination = (
  entity: UserCollectionMetadata,
  uri: string
) => getLocalCollectionCoverArtDestination(entity.playlist_id.toString(), uri)

export const downloadTrackCoverArt = downloadCoverArt(getTrackArtDestination)
export const downloadCollectionCoverArt = downloadCoverArt(
  getCollectionArtDestination
)

/** Download file at uri to destination unless there is already a file at that location or overwrite is true */
export const downloadFile = async (uri: string, destination: string) => {
  const destinationDirectory = path.dirname(destination)
  await mkdirSafe(destinationDirectory)

  const result = await RNFetchBlob.config({
    path: destination
  }).fetch('GET', uri)

  return result?.info().status ?? null
}
