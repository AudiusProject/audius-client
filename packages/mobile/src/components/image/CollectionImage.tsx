import type { Collection, Nullable } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import type { ImageLoaderProps } from 'app/components/core'
import { ImageLoader } from 'app/components/core'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

const { getUser } = cacheUsersSelectors

export const useCollectionImage = (
  collection: Nullable<
    Pick<Collection, 'cover_art_sizes' | 'cover_art' | 'playlist_owner_id'>
  >
) => {
  const cid = collection
    ? collection.cover_art_sizes || collection.cover_art
    : null
  const useLegacyImagePath = !collection?.cover_art_sizes

  const user = useSelector((state) =>
    getUser(state, { id: collection?.playlist_owner_id })
  )

  return useContentNodeImage({
    cid,
    user,
    useLegacyImagePath,
    fallbackImageSource: imageEmpty
  })
}

type CollectionImageProps = {
  collection: Nullable<
    Pick<Collection, 'cover_art_sizes' | 'cover_art' | 'playlist_owner_id'>
  >
} & ImageLoaderProps

export const CollectionImage = (props: CollectionImageProps) => {
  const { collection, ...imageProps } = props
  const { source, handleError } = useCollectionImage(collection)

  return <ImageLoader {...imageProps} source={source} onError={handleError} />
}
