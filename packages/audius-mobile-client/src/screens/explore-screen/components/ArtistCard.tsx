import { useCallback } from 'react'

import { User } from 'audius-client/src/common/models/User'
import { EXPLORE_PAGE } from 'audius-client/src/utils/route'
import { StyleProp, ViewStyle } from 'react-native'

import { Card } from 'app/components/card'
import { useNavigation } from 'app/hooks/useNavigation'
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
    navigation.navigate({
      native: { screen: 'profile', params: { handle } },
      web: { route: handle, fromPage: EXPLORE_PAGE }
    })
  }, [navigation, handle])

  return (
    <Card
      style={style}
      id={artist.user_id}
      imageSize={artist._profile_picture_sizes}
      primaryText={artist.name}
      secondaryText={formatProfileCardSecondaryText(artist.follower_count)}
      onPress={handlePress}
      type='user'
      user={artist}
    />
  )
}
