import type { Nullable, SquareSizes, User } from '@audius/common'

import profilePicEmpty from 'app/assets/images/imageProfilePicEmpty2X.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

type UseUserImageOptions = {
  user: Nullable<
    Pick<
      User,
      'profile_picture_sizes'
      | 'profile_picture_cids'
      | 'profile_picture'
      | 'updatedProfilePicture'
    >
  >
  size: SquareSizes
}

export const useUserImage = ({ user, size }: UseUserImageOptions) => {
  let cid = null
  if (user) {
    cid = user.profile_picture_cids
      ? user.profile_picture_cids[size]
      : user.profile_picture_sizes || user.profile_picture
  }

  const contentNodeImage = useContentNodeImage({
    cid,
    size,
    fallbackImageSource: profilePicEmpty,
    directLink: !!user?.profile_picture_cids
  })

  if (user?.updatedProfilePicture) {
    return {
      source: { uri: user.updatedProfilePicture.url },
      handleError: () => {}
    }
  }
  return contentNodeImage
}

export type UserImageProps = UseUserImageOptions & Partial<FastImageProps>

export const UserImage = (props: UserImageProps) => {
  const { user, size, ...imageProps } = props
  const { source, handleError } = useUserImage({ user, size })

  return <FastImage {...imageProps} source={source} onError={handleError} />
}
