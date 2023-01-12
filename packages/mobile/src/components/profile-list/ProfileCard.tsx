import { useCallback } from 'react'

import type { User } from '@audius/common'

import { Card } from 'app/components/card'
import type { CardProps } from 'app/components/card'
import { UserImage } from 'app/components/image/UserImage'
import { useNavigation } from 'app/hooks/useNavigation'
import { formatCount } from 'app/utils/format'

import type { FastImageProps } from '../image/FastImage'

const formatProfileCardSecondaryText = (followers: number) => {
  const followersText = followers === 1 ? 'Follower' : 'Followers'
  return `${formatCount(followers)} ${followersText}`
}

type ProfileCardProps = Partial<CardProps> & {
  profile: User
}

export const ProfileCard = (props: ProfileCardProps) => {
  const { profile, onPress, ...other } = props
  const { handle } = profile
  const navigation = useNavigation()

  const handlePress = useCallback(() => {
    navigation.push('Profile', { handle })
  }, [navigation, handle])

  const renderImage = useCallback(
    (props: FastImageProps) => <UserImage user={profile} {...props} />,
    [profile]
  )

  return (
    <Card
      renderImage={renderImage}
      primaryText={profile.name}
      secondaryText={formatProfileCardSecondaryText(profile.follower_count)}
      onPress={onPress ?? handlePress}
      type='user'
      user={profile}
      {...other}
    />
  )
}
