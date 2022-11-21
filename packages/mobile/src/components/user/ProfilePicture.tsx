import type { Nullable, User } from '@audius/common'
import { SquareSizes } from '@audius/common'

import type { DynamicImageProps } from 'app/components/core'
import { DynamicImage } from 'app/components/core'
import { useUserProfilePicture } from 'app/hooks/useUserProfilePicture'
import { makeStyles } from 'app/styles/makeStyles'

const useStyles = makeStyles(({ palette }) => ({
  profilePhoto: {
    height: 82,
    width: 82,
    borderRadius: 1000,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: palette.white,
    overflow: 'hidden',
    backgroundColor: palette.neutralLight6
  }
}))

export type ProfilePictureProps = Partial<DynamicImageProps> & {
  profile: Nullable<
    Pick<
      User,
      | 'user_id'
      | 'profile_picture_sizes'
      | 'profile_picture'
      | 'creator_node_endpoint'
    >
  >
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const { styles: stylesProp, profile, ...other } = props
  const styles = useStyles()

  const { source, handleError } = useUserProfilePicture(profile)

  return (
    <DynamicImage
      immediate
      source={source}
      onError={handleError}
      styles={{
        ...stylesProp,
        root: {
          ...styles.profilePhoto
        }
      }}
      {...other}
    />
  )
}
