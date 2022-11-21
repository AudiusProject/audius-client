import type { ReactNode } from 'react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import type { Maybe } from '@audius/common'
import { useInstanceVar } from '@audius/common'
import type {
  ImageProps,
  ImageSourcePropType,
  ImageStyle,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle
} from 'react-native'
import { Animated, Image, StyleSheet, View } from 'react-native'

import Skeleton from 'app/components/skeleton'
import type { StylesProp } from 'app/styles'

export type DynamicImageProps = Omit<ImageProps, 'source'> & {
  source?: ImageSourcePropType
  styles?: StylesProp<{
    root: ViewStyle
    imageContainer: ViewStyle
    image: ImageStyle
  }>
  style?: StyleProp<ViewStyle>
  // Whether or not to immediately animate
  immediate?: boolean
  // overlays rendered above image
  children?: ReactNode
  // callback when image finishes loading
  onLoad?: () => void
  animatedValue?: Animated.Value
  firstOpacity?: number
}

const styles = StyleSheet.create({
  imageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  children: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const interpolateImageScale = (animatedValue: Animated.Value) =>
  animatedValue.interpolate({
    inputRange: [-200, 0],
    outputRange: [4, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp'
  })

const interpolateImageTranslate = (animatedValue: Animated.Value) =>
  animatedValue.interpolate({
    inputRange: [-200, 0],
    outputRange: [-40, 0],
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

/**
 * A dynamic image that transitions between changes to the `uri` prop.
 */
export const DynamicImage = memo(function DynamicImage({
  source,
  style,
  styles: stylesProp,
  immediate,
  children,
  onLoad,
  animatedValue,
  ...imageProps
}: DynamicImageProps) {
  const [size, setSize] = useState(0)
  const skeletonOpacity = useRef(new Animated.Value(1)).current

  const handleSetSize = useCallback((event: LayoutChangeEvent) => {
    setSize(event.nativeEvent.layout.width)
  }, [])

  const handleLoad = useCallback(() => {
    Animated.timing(skeletonOpacity, {
      toValue: 0,
      duration: immediate ? 100 : 500,
      useNativeDriver: true
    }).start(onLoad)
  }, [skeletonOpacity, onLoad, immediate])

  return (
    <Animated.View
      pointerEvents={children ? undefined : 'none'}
      style={[
        stylesProp?.root,
        style,
        animatedValue
          ? {
              transform: [
                {
                  scale: interpolateImageScale(animatedValue)
                },
                {
                  translateY: interpolateImageTranslate(animatedValue)
                }
              ]
            }
          : {}
      ]}
    >
      <Animated.View
        style={[stylesProp?.imageContainer, styles.imageContainer]}
      >
        {source ? (
          <Image
            source={source}
            style={[{ width: size, height: size }, stylesProp?.image]}
            {...imageProps}
            onLoad={handleLoad}
          />
        ) : null}
      </Animated.View>
      <Animated.View
        style={[
          stylesProp?.imageContainer,
          styles.imageContainer,
          { opacity: skeletonOpacity }
        ]}
        onLayout={handleSetSize}
      >
        <Skeleton style={[{ width: size, height: size }, stylesProp?.image]} />
      </Animated.View>
      {children ? <View style={styles.children}>{children}</View> : null}
    </Animated.View>
  )
})
