import { useCallback } from 'react'

import { User } from 'audius-client/src/common/models/User'
import { TouchableOpacity } from 'react-native'

import { Text } from 'app/components/core'
import UserBadges from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'

type ArtistLinkProps = {
  artist: User
}

export const ArtistLink = (props: ArtistLinkProps) => {
  const navigation = useNavigation()

  const { artist } = props
  const { name } = artist

  const handleArtistPress = useCallback(() => {
    navigation.push({
      native: { screen: 'Profile', params: { handle: artist.handle } },
      web: { route: `/${artist.handle}` }
    })
  }, [navigation, artist])

  return (
    <TouchableOpacity
      style={{ flexDirection: 'row' }}
      onPress={handleArtistPress}
    >
      <Text color='secondary' variant='h3'>
        {name}
      </Text>
      <UserBadges user={artist} hideName badgeSize={8} />
    </TouchableOpacity>
  )
}
