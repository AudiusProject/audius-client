import { BlurView } from '@react-native-community/blur'
import { Animated, Platform, StyleSheet } from 'react-native'

import BadgeArtist from 'app/assets/images/badgeArtist.svg'
import { CoverPhotoImage } from 'app/components/cover-photo-image'
import { makeStyles } from 'app/styles/makeStyles'

import { useSelectProfile } from './selectors'

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const useStyles = makeStyles(({ spacing }) => ({
  artistBadge: {
    position: 'absolute',
    top: spacing(5),
    right: spacing(3)
  },
  imageRoot: {
    height: 96
  },
  image: {
    height: '100%'
  }
}))

const interpolateBlurViewOpacity = (scrollY: Animated.Value) =>
  scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp'
  })

const interpolateBadgeImagePosition = (scrollY: Animated.Value) =>
  scrollY.interpolate({
    inputRange: [-200, 0],
    outputRange: [-200, 0],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp'
  })

export const CoverPhoto = ({ scrollY }: { scrollY?: Animated.Value }) => {
  const styles = useStyles()
  const user = useSelectProfile([
    'user_id',
    'cover_photo_sizes',
    'cover_photo',
    'creator_node_endpoint',
    'track_count'
  ])

  const { track_count } = user

  const isArtist = track_count > 0

  return (
    <>
      <CoverPhotoImage
        animatedValue={scrollY}
        styles={{ root: styles.imageRoot, image: styles.image }}
        user={user}
      >
        {/*
          Disable blur on android because it causes a crash.
          See https://github.com/software-mansion/react-native-screens/pull/1406
          Updating to react-native-screens 3.16.0 did not seem to fix (for certain images)
          Still seems to be an outstanding issue: https://github.com/Kureev/react-native-blur/issues/461
        */}
        {Platform.OS === 'ios' ? (
          <AnimatedBlurView
            blurType={'dark'}
            blurAmount={100}
            style={[
              { ...StyleSheet.absoluteFillObject, zIndex: 2 },
              scrollY
                ? { opacity: interpolateBlurViewOpacity(scrollY) }
                : undefined
            ]}
          />
        ) : null}
      </CoverPhotoImage>
      {isArtist ? (
        <Animated.View
          style={[
            styles.artistBadge,
            scrollY
              ? {
                  transform: [
                    {
                      translateY: interpolateBadgeImagePosition(scrollY)
                    }
                  ]
                }
              : undefined
          ]}
        >
          <BadgeArtist />
        </Animated.View>
      ) : null}
    </>
  )
}
