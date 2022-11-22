import { useState, useRef, useEffect } from 'react'

import { Animated, StyleSheet } from 'react-native'
import * as BootSplash from 'react-native-bootsplash'

import SplashLogo from 'app/assets/images/bootsplash_logo.svg'
import { makeStyles } from 'app/styles'
import { zIndex } from 'app/utils/zIndex'

/**
 * Assets for this splash screen are generated with
 * npx react-native generate-bootsplash \
 *  src/assets/images/bootsplash_logo.png \
 *  --background-color=7E1BCC \
 *  --logo-width=150 \
 *  --assets-path=src/assets/images
 */

// Extra larger render width so when we scale it up,
// resolution is maintained.
const RENDER_WIDTH = 1000
const START_SIZE = 0.15
const END_SIZE = 1

const useStyles = makeStyles(({ palette }) => {
  return {
    splash: {
      zIndex: zIndex.SPLASH_SCREEN,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.secondary
    },
    logo: {
      width: RENDER_WIDTH
    }
  }
})

type SplashScreenProps = {
  canDismiss: boolean
}

export const SplashScreen = ({ canDismiss }: SplashScreenProps) => {
  const styles = useStyles()
  const opacity = useRef(new Animated.Value(1)).current
  const scale = useRef(new Animated.Value(START_SIZE)).current
  const [isShowing, setIsShowing] = useState(true)

  useEffect(() => {
    if (canDismiss) {
      // Hide bootsplash and replace with our own splash screen
      BootSplash.hide()
      // Animate smaller, then bigger with a fade out at the same time
      Animated.sequence([
        Animated.spring(scale, {
          useNativeDriver: true,
          tension: 10,
          friction: 200,
          toValue: START_SIZE * 0.8
        }),
        Animated.parallel([
          Animated.spring(scale, {
            useNativeDriver: true,
            tension: 100,
            friction: 50,
            toValue: END_SIZE
          }),
          Animated.spring(opacity, {
            useNativeDriver: true,
            tension: 100,
            friction: 50,
            toValue: 0
          })
        ])
      ]).start(() => {
        setIsShowing(false)
      })
    }
  }, [canDismiss, scale, opacity])

  return isShowing ? (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.splash, { opacity }]}
    >
      <Animated.View
        style={[
          styles.logo,
          { transform: [{ scaleX: scale }, { scaleY: scale }] }
        ]}
      >
        <SplashLogo />
      </Animated.View>
    </Animated.View>
  ) : null
}
