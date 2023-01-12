import type { Collection, Nullable, User } from '@audius/common'
import { cacheUsersSelectors } from '@audius/common'
import { useSelector } from 'react-redux'

import imageEmpty from 'app/assets/images/imageBlank2x.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

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

  const contentNodeSource = useContentNodeImage({
    cid,
    user: selectedUser ?? user ?? null,
    fallbackImageSource: imageEmpty
  })

  return contentNodeSource
}

type CollectionImageProps = {
  collection: ImageCollection
  user?: ImageUser
} & FastImageProps

export const CollectionImage = (props: CollectionImageProps) => {
  const { collection, user, ...imageProps } = props
  const { source, handleError } = useCollectionImage(collection, user)

  return <FastImage {...imageProps} source={source} onError={handleError} />
}
