import { useCallback } from 'react'

import { playerSelectors } from '@audius/common'
import type { Remix, User, UID, CommonState } from '@audius/common'
import type { ImageSourcePropType } from 'react-native'
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
const { getPlaying } = playerSelectors

const messages = {
  coSign: 'Co-Sign'
}

type Props = {
  artistName: string
  coSign?: Remix | null
  imageSource?: ImageSourcePropType
  onImageError?: () => void
  onPressTitle?: GestureResponderHandler
  setArtworkLoaded: (loaded: boolean) => void
  title: string
  user: User
  uid: UID
  isPlayingUid: boolean
}

export const LineupTileMetadata = ({
  artistName,
  coSign,
  imageSource,
  onImageError,
  onPressTitle,
  setArtworkLoaded,
  title,
  user,
  isPlayingUid
}: Props) => {
  const navigation = useNavigation()
  const styles = useStyles()
  const trackTileStyles = useTrackTileStyles()
  const { primary } = useThemeColors()

  const isActive = useSelector(
    (state: CommonState) => getPlaying(state) && isPlayingUid
  )

  const handleArtistPress = useCallback(() => {
    navigation.push('Profile', { handle: user.handle })
  }, [navigation, user])
  return (
    <View style={styles.metadata}>
      <LineupTileArt
        imageSource={imageSource}
        onError={onImageError}
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
