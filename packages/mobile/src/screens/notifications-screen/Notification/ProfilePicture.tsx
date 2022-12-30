import { useCallback } from 'react'

import { TouchableOpacity } from 'react-native'

import type { UserImageProps } from 'app/components/image/UserImage'
import type { ProfilePictureProps as ProfilePictureBaseProps } from 'app/components/user'
import { ProfilePicture as ProfilePictureBase } from 'app/components/user'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ palette, spacing }) => ({
  image: {
    height: spacing(10) - 2,
    width: spacing(10) - 2,
    borderRadius: spacing(5),
    borderColor: palette.white,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: palette.neutralLight4,
    marginRight: spacing(2)
  }
}))

type ProfilePictureProps = ProfilePictureBaseProps & {
  profile: UserImageProps['user'] & { handle: string }
  navigationType?: 'push' | 'navigate'
  interactive?: boolean
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const {
    profile,
    style,
    navigationType = 'navigate',
    interactive = true,
    ...other
  } = props
  const styles = useStyles()
  const navigation = useNavigation()

  const handlePress = useCallback(() => {
    if (profile) {
      const screen = 'Profile'
      const params = {
        handle: profile.handle,
        fromNotifications: true
      }
      if (navigationType === 'push') navigation.push(screen, params)
      if (navigationType === 'navigate') navigation.navigate(screen, params)
    }
  }, [navigation, navigationType, profile])

  const profilePictureElement = (
    <ProfilePictureBase
      profile={profile}
      style={[styles.image, style]}
      {...other}
    />
  )

  if (interactive) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={interactive ? handlePress : undefined}
      >
        {profilePictureElement}
      </TouchableOpacity>
    )
  }

  return profilePictureElement
}
