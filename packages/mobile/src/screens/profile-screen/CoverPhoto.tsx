import { BlurView } from '@react-native-community/blur'
import { WidthSizes } from 'audius-client/src/common/models/ImageSizes'
import { Animated, StyleSheet } from 'react-native'

import BadgeArtist from 'app/assets/images/badgeArtist.svg'
import { DynamicImage } from 'app/components/core'
import { useUserCoverPhoto } from 'app/hooks/useUserCoverPhoto'
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

export const CoverPhoto = ({ scrollY }: { scrollY?: Animated.Value }) => {
  const styles = useStyles()
  const { user_id, _cover_photo_sizes, track_count } = useSelectProfile([
    'user_id',
    '_cover_photo_sizes',
    'track_count'
  ])

  const coverPhoto = useUserCoverPhoto({
    id: user_id,
    sizes: _cover_photo_sizes,
    size: WidthSizes.SIZE_2000
  })

  const isArtist = track_count > 0

  return (
    <>
      <DynamicImage
        animatedValue={scrollY}
        uri={coverPhoto}
        styles={{ root: styles.imageRoot, image: styles.image }}
      >
        <AnimatedBlurView
          blurType={'dark'}
          blurAmount={96}
          style={{
            ...StyleSheet.absoluteFillObject,
            zIndex: 2,
            opacity: scrollY?.interpolate({
              inputRange: [-50, 0, 50, 100],
              outputRange: [1, 0, 0, 1]
            })
          }}
        />
      </DynamicImage>
      {isArtist ? (
        <Animated.View
          style={[
            styles.artistBadge,
            scrollY
              ? {
                  transform: [
                    {
                      translateY: scrollY.interpolate({
                        inputRange: [-200, 0],
                        outputRange: [-200, 0],
                        extrapolateLeft: 'extend',
                        extrapolateRight: 'clamp'
                      })
                    }
                  ]
                }
              : {}
          ]}
        >
          <BadgeArtist />
        </Animated.View>
      ) : null}
    </>
  )
}
