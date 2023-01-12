import type { Nullable, User } from '@audius/common'
import type { FastImageProps, Source } from 'react-native-fast-image'
import FastImage from 'react-native-fast-image'

import profilePicEmpty from 'app/assets/images/imageProfilePicEmpty2X.png'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

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

export type UserImageProps = Partial<Omit<FastImageProps, 'source'>> & {
  source?: Partial<Source>
  user?: Nullable<ImageUser>
}

export const UserImage = (props: UserImageProps) => {
  const { user, source: sourceProp, ...other } = props
  const { source, handleError } = useUserImage(user)

  const imageSource =
    typeof source === 'number'
      ? source
      : { ...sourceProp, uri: source?.[0]?.uri }

  return <FastImage source={imageSource} onError={handleError} {...other} />
}
