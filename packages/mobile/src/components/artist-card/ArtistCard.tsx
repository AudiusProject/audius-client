import { useCallback } from 'react'

import type { User } from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'

import { Card } from 'app/components/card'
import { useNavigation } from 'app/hooks/useNavigation'
import { useUserProfilePicture } from 'app/hooks/useUserProfilePicture'
import { formatCount } from 'app/utils/format'

const formatProfileCardSecondaryText = (followers: number) => {
  const followersText = followers === 1 ? 'Follower' : 'Followers'
  return `${formatCount(followers)} ${followersText}`
}

type ArtistCardProps = {
  artist: User
  style?: StyleProp<ViewStyle>
}

export const ArtistCard = ({ artist, style }: ArtistCardProps) => {
  const { handle } = artist
  const navigation = useNavigation()
  const handlePress = useCallback(() => {
    navigation.push('Profile', { handle })
  }, [navigation, handle])

  const { source: imageSource, handleError: handleImageError } =
    useUserProfilePicture(artist)

  return (
    <Card
      style={style}
      imageSource={imageSource}
      onImageError={handleImageError}
      primaryText={artist.name}
      secondaryText={formatProfileCardSecondaryText(artist.follower_count)}
      onPress={handlePress}
      type='user'
      user={artist}
    />
  )
}
