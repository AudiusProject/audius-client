import { useCallback, useEffect, useRef, useState } from 'react'

import { FavoriteSource } from 'audius-client/src/common/models/Analytics'
import { SquareSizes } from 'audius-client/src/common/models/ImageSizes'
import { Track } from 'audius-client/src/common/models/Track'
import { User } from 'audius-client/src/common/models/User'
import {
  saveTrack,
  unsaveTrack
} from 'audius-client/src/common/store/social/tracks/actions'
import { TouchableOpacity, Animated, View, Dimensions } from 'react-native'

import { DynamicImage } from 'app/components/core'
import { FavoriteButton } from 'app/components/favorite-button'
import Text from 'app/components/text'
import { useDispatchWeb } from 'app/hooks/useDispatchWeb'
import { useTrackCoverArt } from 'app/hooks/useTrackCoverArt'
import { makeStyles } from 'app/styles'

import { PlayButton } from './PlayButton'
import { TrackingBar } from './TrackingBar'
import { NOW_PLAYING_HEIGHT, PLAY_BAR_HEIGHT } from './constants'

const SEEK_INTERVAL = 200

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    width: '100%',
    height: PLAY_BAR_HEIGHT,
    alignItems: 'center'
  },
  container: {
    height: '100%',
    width: '100%',
    paddingLeft: spacing(3),
    paddingRight: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  playIcon: {
    width: spacing(8),
    height: spacing(8)
  },
  icon: {
    width: 28,
    height: 28
  },
  trackInfo: {
    height: '100%',
    flexShrink: 1,
    flexGrow: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  artwork: {
    marginLeft: spacing(3),
    height: 26,
    width: 26,
    overflow: 'hidden',
    backgroundColor: palette.neutralLight7,
    borderRadius: 2
  },
  trackText: {
    alignItems: 'center',
    marginLeft: spacing(3),
    flexDirection: 'row'
  },
  title: {
    color: palette.neutral,
    maxWidth: Dimensions.get('window').width / 3,
    fontSize: spacing(3)
  },
  separator: {
    color: palette.neutral,
    marginLeft: spacing(1),
    marginRight: spacing(1),
    fontSize: spacing(4)
  },
  artist: {
    color: palette.neutral,
    maxWidth: Dimensions.get('window').width / 4,
    fontSize: spacing(3)
  }
}))

type PlayBarProps = {
  track: Track
  user: User
  onPress: () => void
  translationAnim: Animated.Value
}

const PlayBarArtwork = ({ track }: { track: Track }) => {
  const image = useTrackCoverArt({
    id: track.track_id,
    sizes: track._cover_art_sizes,
    size: SquareSizes.SIZE_150_BY_150
  })
  return <DynamicImage uri={image} />
}

export const PlayBar = ({
  track,
  user,
  onPress,
  translationAnim
}: PlayBarProps) => {
  const styles = useStyles()
  const dispatchWeb = useDispatchWeb()
  const [percentComplete, setPercentComplete] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const { currentTime, seekableDuration } = global.progress
      if (seekableDuration !== undefined) {
        setPercentComplete(currentTime / seekableDuration)
      } else {
        setPercentComplete(0)
      }
    }, SEEK_INTERVAL)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [setPercentComplete, intervalRef])

  const onPressFavoriteButton = useCallback(() => {
    if (track) {
      if (track.has_current_user_saved) {
        dispatchWeb(unsaveTrack(track.track_id, FavoriteSource.PLAYBAR))
      } else {
        dispatchWeb(saveTrack(track.track_id, FavoriteSource.PLAYBAR))
      }
    }
  }, [dispatchWeb, track])

  const renderFavoriteButton = () => {
    return (
      <FavoriteButton
        onPress={onPressFavoriteButton}
        isActive={track?.has_current_user_saved ?? false}
        wrapperStyle={styles.icon}
      />
    )
  }

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: translationAnim.interpolate({
            // Interpolate the animation such that the play bar fades out
            // at 25% up the screen.
            inputRange: [
              0,
              0.75 * (NOW_PLAYING_HEIGHT - PLAY_BAR_HEIGHT),
              NOW_PLAYING_HEIGHT - PLAY_BAR_HEIGHT
            ],
            outputRange: [0, 0, 1],
            extrapolate: 'extend'
          })
        }
      ]}
    >
      <TrackingBar
        percentComplete={percentComplete}
        translationAnim={translationAnim}
      />
      <View style={styles.container}>
        {renderFavoriteButton()}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.trackInfo}
          onPress={onPress}
        >
          <View style={styles.artwork}>
            {track && <PlayBarArtwork track={track} />}
          </View>
          <View style={styles.trackText}>
            <Text numberOfLines={1} weight='bold' style={styles.title}>
              {track?.title ?? ''}
            </Text>
            <Text
              weight='bold'
              style={styles.separator}
              accessibilityElementsHidden
            >
              {track ? '•' : ''}
            </Text>
            <Text numberOfLines={1} weight='medium' style={styles.artist}>
              {user?.name ?? ''}
            </Text>
          </View>
        </TouchableOpacity>
        <PlayButton wrapperStyle={styles.playIcon} />
      </View>
    </Animated.View>
  )
}
