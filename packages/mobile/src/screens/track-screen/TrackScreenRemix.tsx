import { useCallback } from 'react'

import type { ID, Track, User } from '@audius/common'
import { SquareSizes, tracksSelectors, usersSelectors } from '@audius/common'
import type { StyleProp, ViewStyle } from 'react-native'
import { Pressable, View } from 'react-native'
import { useSelector } from 'react-redux'

import CoSign from 'app/components/co-sign/CoSign'
import { Size } from 'app/components/co-sign/types'
import { TrackImage } from 'app/components/image/TrackImage'
import { UserImage } from 'app/components/image/UserImage'
import Text from 'app/components/text'
import UserBadges from 'app/components/user-badges'
import { useNavigation } from 'app/hooks/useNavigation'
import type { StylesProp } from 'app/styles'
import { flexRowCentered, makeStyles } from 'app/styles'
const { getUserFromTrack } = usersSelectors
const { getTrack } = tracksSelectors

const messages = {
  by: 'By '
}

type TrackScreenRemixProps = {
  id: ID
} & Omit<TrackScreenRemixComponentProps, 'track' | 'user'>

const useStyles = makeStyles(({ palette, spacing, typography }) => ({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2)
  },

  coverArt: {
    width: 121,
    height: 121,
    borderWidth: 1,
    borderColor: palette.neutralLight8,
    borderRadius: 4,
    overflow: 'hidden'
  },

  profilePicture: {
    zIndex: 1,
    overflow: 'hidden',
    position: 'absolute',
    top: spacing(-2),
    left: spacing(-2),
    height: 36,
    width: 36,
    borderWidth: 2,
    borderColor: palette.neutralLight8,
    borderRadius: 18
  },

  artist: {
    marginTop: spacing(2),
    ...flexRowCentered(),
    ...typography.body,
    textAlign: 'center'
  },

  name: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: 128
  },

  artistName: {
    color: palette.secondary
  },

  badges: {
    marginLeft: spacing(1),
    top: spacing(0.5)
  }
}))

export const TrackScreenRemix = ({ id, ...props }: TrackScreenRemixProps) => {
  const track = useSelector((state) => getTrack(state, { id }))
  const user = useSelector((state) => getUserFromTrack(state, { id }))

  if (!track || !user) {
    console.warn(
      'Track or user missing for TrackScreenRemix, preventing render'
    )
    return null
  }

  return <TrackScreenRemixComponent {...props} track={track} user={user} />
}

type TrackScreenRemixComponentProps = {
  style?: StyleProp<ViewStyle>
  styles?: StylesProp<{
    root: ViewStyle
  }>
  track: Track
  user: User
}

const TrackScreenRemixComponent = ({
  style,
  styles: stylesProp,
  track,
  user
}: TrackScreenRemixComponentProps) => {
  const styles = useStyles()

  const { _co_sign, track_id } = track
  const { name, handle } = user
  const navigation = useNavigation()

  const handlePressTrack = useCallback(() => {
    navigation.push('Track', { id: track_id })
  }, [navigation, track_id])

  const handlePressArtist = useCallback(() => {
    navigation.push('Profile', { handle })
  }, [handle, navigation])

  const images = (
    <>
      <View style={styles.profilePicture}>
        <UserImage user={user} size={SquareSizes.SIZE_150_BY_150} />
      </View>
      <View style={styles.coverArt}>
        <TrackImage track={track} size={SquareSizes.SIZE_480_BY_480} />
      </View>
    </>
  )

  return (
    <View style={[styles.root, style, stylesProp?.root]}>
      <Pressable onPress={handlePressTrack}>
        {_co_sign ? (
          <CoSign size={Size.MEDIUM} style={{ flex: 0 }}>
            {images}
          </CoSign>
        ) : (
          images
        )}
      </Pressable>
      <Pressable style={styles.artist} onPress={handlePressArtist}>
        <View style={styles.name}>
          <Text>{messages.by}</Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.badges}>
            <UserBadges user={user} badgeSize={12} hideName />
          </View>
        </View>
      </Pressable>
    </View>
  )
}
