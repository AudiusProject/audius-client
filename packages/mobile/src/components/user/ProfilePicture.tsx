import { StyleSheet } from 'react-native'
import type { ImageStyle } from 'react-native-fast-image'

import type { UserImageProps } from 'app/components/image/UserImage'
import { UserImage } from 'app/components/image/UserImage'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ palette }) => ({
  profilePhoto: {
    height: 82,
    width: 82,
    borderRadius: 1000,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: palette.neutralLight9,
    overflow: 'hidden',
    backgroundColor: palette.neutralLight6
  }
}))

export type ProfilePictureProps = Partial<Omit<UserImageProps, 'user'>> & {
  profile: UserImageProps['user']
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const { profile, style: styleProp, ...other } = props
  const styles = useStyles()

  const style = StyleSheet.flatten([
    styles.profilePhoto,
    styleProp
  ]) as ImageStyle

  return <UserImage user={profile} style={style} {...other} />
}
