import type {
  Collection,
  ID,
  Maybe,
  Nullable,
  SearchPlaylist,
  SquareSizes
} from '@audius/common'
import { reachabilitySelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'
import { getLocalCollectionCoverArtPath } from 'app/services/offline-downloader'
import { getCollectionDownloadStatus } from 'app/store/offline-downloads/selectors'
import { OfflineDownloadStatus } from 'app/store/offline-downloads/slice'
import { useThemeColors } from 'app/utils/theme'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

const { getIsReachable } = reachabilitySelectors

type UseCollectionImageOptions = {
  collection: Nullable<
    Pick<
      Collection | SearchPlaylist,
      | 'playlist_id'
      | 'cover_art_sizes'
      | 'cover_art_cids'
      | 'cover_art'
      | 'playlist_owner_id'
      | '_cover_art_sizes'
    >
  >
  size: SquareSizes
}

const useLocalCollectionImageUri = (collectionId: Maybe<ID>) => {
  const collectionImageUri = useSelector((state) => {
    if (!collectionId) return null

    const isReachable = getIsReachable(state)
    if (isReachable) return null

    const collectionDownloadStatus = getCollectionDownloadStatus(
      state,
      collectionId
    )
    const isDownloaded =
      collectionDownloadStatus === OfflineDownloadStatus.SUCCESS

    if (!isDownloaded) return null

    return `file://${getLocalCollectionCoverArtPath(collectionId.toString())}`
  })

  return collectionImageUri
}

export const useCollectionImage = (options: UseCollectionImageOptions) => {
  const { collection, size } = options
  const optimisticCoverArt = collection?._cover_art_sizes?.OVERRIDE
  const cid = collection
    ? collection.cover_art_sizes || collection.cover_art
    : null

  const localCollectionImageUri = useLocalCollectionImageUri(
    collection?.playlist_id
  )

  const localSourceUri = optimisticCoverArt || localCollectionImageUri

  const contentNodeSource = useContentNodeImage({
    cid,
    size,
    fallbackImageSource: imageEmpty,
    localSource: localSourceUri ? { uri: localSourceUri } : null,
    cidMap: collection?.cover_art_cids
  })

  return contentNodeSource
}

type CollectionImageProps = UseCollectionImageOptions & Partial<FastImageProps>

export const CollectionImage = (props: CollectionImageProps) => {
  const { collection, size, style, ...other } = props

  const collectionImageSource = useCollectionImage({ collection, size })
  const { neutralLight6 } = useThemeColors()

  if (!collectionImageSource) return null

  const { source, handleError, isFallbackImage } = collectionImageSource

  if (isFallbackImage) {
    return (
      <FastImage
        {...other}
        style={[style, { backgroundColor: neutralLight6 }]}
        source={source}
        onError={handleError}
      />
    )
  }

  return (
    <FastImage {...other} style={style} source={source} onError={handleError} />
  )
}
