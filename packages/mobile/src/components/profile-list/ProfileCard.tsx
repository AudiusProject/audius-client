import { useCallback } from 'react'

import type { User } from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'

import { Card } from 'app/components/card'
import { UserImage } from 'app/components/image/UserImage'
import { useNavigation } from 'app/hooks/useNavigation'
import { formatCount } from 'app/utils/format'

const formatProfileCardSecondaryText = (followers: number) => {
  const followersText = followers === 1 ? 'Follower' : 'Followers'
  return `${formatCount(followers)} ${followersText}`
}

type ProfileCardProps = {
  profile: User
  style?: StyleProp<ViewStyle>
  onPress?: () => void
}

export const ProfileCard = (props: ProfileCardProps) => {
  const { profile, style, onPress } = props
  const { handle } = profile
  const navigation = useNavigation()

  const handlePress = useCallback(() => {
    navigation.push('Profile', { handle })
  }, [navigation, handle])

  const renderImage = useCallback(() => <UserImage user={profile} />, [profile])

  return (
    <Card
      style={style}
      renderImage={renderImage}
      primaryText={profile.name}
      secondaryText={formatProfileCardSecondaryText(profile.follower_count)}
      onPress={onPress ?? handlePress}
      type='user'
      user={profile}
    />
  )
}
