import type { Nullable, User } from '@audius/common'

import type { DynamicImageProps } from 'app/components/core'
import { DynamicImage } from 'app/components/core'
import { useUserCoverPhoto } from 'app/hooks/useUserCoverPhoto'

type CoverPhotoImageProps = {
  user: Nullable<
    Pick<User, 'cover_photo_sizes' | 'cover_photo' | 'creator_node_endpoint'>
  >
} & DynamicImageProps

export const CoverPhotoImage = (props: CoverPhotoImageProps) => {
  const { user, ...imageProps } = props

  const { source, handleError } = useUserCoverPhoto(user)

  return <DynamicImage {...imageProps} source={source} onError={handleError} />
}
