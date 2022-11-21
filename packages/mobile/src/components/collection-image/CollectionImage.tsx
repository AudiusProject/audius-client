import type { Collection, Nullable } from '@audius/common'

import type { DynamicImageProps } from 'app/components/core'
import { DynamicImage } from 'app/components/core'
import { useCollectionCoverArt } from 'app/hooks/useCollectionCoverArt'

type CollectionImageProps = {
  collection: Nullable<
    Pick<Collection, 'cover_art_sizes' | 'cover_art' | 'playlist_owner_id'>
  >
} & DynamicImageProps

export const CollectionImage = (props: CollectionImageProps) => {
  const { collection, ...imageProps } = props
  const { source, handleError } = useCollectionCoverArt(collection)

  return <DynamicImage {...imageProps} source={source} onError={handleError} />
}
