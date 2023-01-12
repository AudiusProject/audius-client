import type { Nullable, User } from '@audius/common'

import profilePicEmpty from 'app/assets/images/imageProfilePicEmpty2X.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

type ImageUser = Pick<
  User,
  'profile_picture_sizes' | 'profile_picture' | 'creator_node_endpoint'
>

export const useUserImage = (user?: Nullable<ImageUser>) => {
  const cid = user ? user.profile_picture_sizes || user.profile_picture : null

  return useContentNodeImage({
    cid,
    user: user ?? null,
    fallbackImageSource: profilePicEmpty
  })
}

export type UserImageProps = FastImageProps & {
  user?: Nullable<ImageUser>
}

export const UserImage = (props: UserImageProps) => {
  const { user, ...other } = props
  const { source, handleError } = useUserImage(user)

  return <FastImage source={source} onError={handleError} {...other} />
}
