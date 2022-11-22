import type { Nullable, User } from '@audius/common'
import { WidthSizes } from '@audius/common'

import imageCoverPhotoBlank from 'app/assets/images/imageCoverPhotoBlank.jpg'
import type { ImageLoaderProps } from 'app/components/core'
import { ImageLoader } from 'app/components/core'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

export const useUserCoverImage = (
  user: Nullable<
    Pick<User, 'cover_photo_sizes' | 'cover_photo' | 'creator_node_endpoint'>
  >
) => {
  const cid = user ? user.cover_photo_sizes || user.cover_photo : null

  return useContentNodeImage({
    cid,
    user,
    sizes: WidthSizes,
    fallbackImageSource: imageCoverPhotoBlank
  })
}

type UserCoverImageProps = {
  user: Parameters<typeof useUserCoverImage>[0]
} & ImageLoaderProps

export const UserCoverImage = (props: UserCoverImageProps) => {
  const { user, ...imageProps } = props

  const { source, handleError } = useUserCoverImage(user)

  return <ImageLoader {...imageProps} source={source} onError={handleError} />
}
