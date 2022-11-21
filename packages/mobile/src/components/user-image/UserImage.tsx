import type { DynamicImageProps } from 'app/components/core'
import { DynamicImage } from 'app/components/core'
import { useUserProfilePicture } from 'app/hooks/useUserProfilePicture'

export type UserImageProps = {
  user: Parameters<typeof useUserProfilePicture>[0]
} & DynamicImageProps

export const UserImage = (props: UserImageProps) => {
  const { user, ...imageProps } = props
  const { source, handleError } = useUserProfilePicture(user)

  return <DynamicImage {...imageProps} source={source} onError={handleError} />
}
