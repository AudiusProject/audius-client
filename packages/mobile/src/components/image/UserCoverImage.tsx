import type { Nullable, User } from '@audius/common'
import { WidthSizes } from '@audius/common'
import { Animated } from 'react-native'

import imageCoverPhotoBlank from 'app/assets/images/imageCoverPhotoBlank.jpg'
import { useContentNodeImage } from 'app/hooks/useContentNodeImage'

import type { FastImageProps } from './FastImage'
import { FastImage } from './FastImage'

const interpolateImageScale = (animatedValue: Animated.Value) =>
  animatedValue.interpolate({
    inputRange: [-200, 0],
    outputRange: [4, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp'
  })

const interpolateImageTranslate = (animatedValue: Animated.Value) =>
  animatedValue.interpolate({
    inputRange: [-200, 0],
    outputRange: [-40, 0],
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

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
  animatedValue?: Animated.Value
} & FastImageProps

export const UserCoverImage = (props: UserCoverImageProps) => {
  const { user, animatedValue, ...imageProps } = props

  const { source, handleError } = useUserCoverImage(user)

  return (
    <Animated.View
      style={
        animatedValue && {
          transform: [
            { scale: interpolateImageScale(animatedValue) },
            { translateY: interpolateImageTranslate(animatedValue) }
          ]
        }
      }
    >
      <FastImage
        size='medium'
        source={source}
        onError={handleError}
        {...imageProps}
      />
    </Animated.View>
  )
}
