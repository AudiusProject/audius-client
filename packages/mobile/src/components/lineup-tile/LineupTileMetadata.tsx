import { useCallback } from 'react'

import { playerSelectors } from '@audius/common'
import type { Remix, User, UID } from '@audius/common'
import { TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'

import IconVolume from 'app/assets/images/iconVolume.svg'
import Text from 'app/components/text'
import UserBadges from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'
import type { GestureResponderHandler } from 'app/types/gesture'
import { useThemeColors } from 'app/utils/theme'

import { LineupTileArt } from './LineupTileArt'
import { useStyles as useTrackTileStyles } from './styles'

const useStyles = makeStyles(({ palette }) => ({
  metadata: {
    flexDirection: 'row'
  },
  titlesActive: {
    color: palette.primary
  },
  titlesPressed: {
    textDecorationLine: 'underline'
  },
  titleText: {
    fontSize: 16
  },
  playingIndicator: {
    marginLeft: 8
  },
  badge: {
    marginLeft: 4
  },
  coSignLabel: {
    position: 'absolute',
    bottom: -3,
    left: 96,
    color: palette.primary,
    fontSize: 12,
    letterSpacing: 1,
    lineHeight: 15,
    textTransform: 'uppercase'
  }
}))
const { getUid, getPlaying } = playerSelectors

const messages = {
  coSign: 'Co-Sign'
}

type Props = {
  artistName: string
  coSign?: Remix | null
  imageUrl?: string
  onPressTitle?: GestureResponderHandler
  setArtworkLoaded: (loaded: boolean) => void
  title: string
  user: User
  uid: UID
}

export const LineupTileMetadata = ({
  artistName,
  coSign,
  imageUrl,
  onPressTitle,
  setArtworkLoaded,
  title,
  user,
  uid
}: Props) => {
  const navigation = useNavigation()
  const styles = useStyles()
  const trackTileStyles = useTrackTileStyles()
  const { primary } = useThemeColors()

  const handleArtistPress = useCallback(() => {
    navigation.push('Profile', { handle: user.handle })
  }, [navigation, user])

  const isPlaying = useSelector(getPlaying)
  const playingUid = useSelector(getUid)
  const isPlayingUid = playingUid === uid

  const isActive = Boolean(isPlayingUid && isPlaying)

  return (
    <View style={styles.metadata}>
      <LineupTileArt
        imageUrl={imageUrl}
        onLoad={() => setArtworkLoaded(true)}
        coSign={coSign}
        style={trackTileStyles.imageContainer}
      />
      <View style={trackTileStyles.titles}>
        <TouchableOpacity style={trackTileStyles.title} onPress={onPressTitle}>
          <>
            <Text
              style={[styles.titleText, isActive && styles.titlesActive]}
              weight='bold'
              numberOfLines={1}
            >
              {title}
            </Text>
            {!isActive ? null : (
              <IconVolume fill={primary} style={styles.playingIndicator} />
            )}
          </>
        </TouchableOpacity>
        <TouchableOpacity
          style={trackTileStyles.artist}
          onPress={handleArtistPress}
        >
          <>
            <Text
              style={[styles.titleText, isActive && styles.titlesActive]}
              weight='medium'
              numberOfLines={1}
            >
              {artistName}
            </Text>
            <UserBadges
              user={user}
              badgeSize={12}
              style={styles.badge}
              hideName
            />
          </>
        </TouchableOpacity>
      </View>
      {coSign && (
        <Text style={styles.coSignLabel} weight='heavy'>
          {messages.coSign}
        </Text>
      )}
    </View>
  )
}
