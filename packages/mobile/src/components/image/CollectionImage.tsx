import type { Collection, Nullable, User } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import type { ImageStyle } from 'react-native-fast-image'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'
import { useLocalCollectionImage } from 'app/hooks/useLocalImage'
import type { StylesProp } from 'app/styles'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

const { getUser } = cacheUsersSelectors

type ImageCollection = Nullable<
  Pick<
    Collection,
    'cover_art_sizes' | 'cover_art' | 'playlist_owner_id' | 'playlist_id'
  >
>

type ImageUser = Pick<User, 'creator_node_endpoint'>

export const useCollectionImage = (
  collection: ImageCollection,
  user?: ImageUser
) => {
  const cid = collection
    ? collection.cover_art_sizes || collection.cover_art
    : null

  const selectedUser = useSelector((state) =>
    getUser(state, { id: collection?.playlist_owner_id })
  )

  const { value: localSource, loading } = useLocalCollectionImage(
    collection?.playlist_id.toString()
  )

  const contentNodeSource = useContentNodeImage({
    cid,
    user: selectedUser ?? user ?? null,
    fallbackImageSource: imageEmpty,
    localSource
  })

  return loading ? null : contentNodeSource
}

type CollectionImageProps = {
  collection: ImageCollection
  user?: ImageUser
  styles?: StylesProp<{
    image: ImageStyle
  }>
} & FastImageProps

export const CollectionImage = (props: CollectionImageProps) => {
  const { collection, user, styles, style, ...imageProps } = props
  const collectionImageSource = useCollectionImage(collection, user)
  if (!collectionImageSource) return null

  const { source, handleError } = collectionImageSource

  return (
    <FastImage
      {...imageProps}
      style={[style, styles?.image]}
      source={source}
      onError={handleError}
    />
  )
}
