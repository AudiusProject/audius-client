import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'

import { StyleSheet, Animated, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Text from 'app/components/text'
import { useThemedStyles } from 'app/hooks/useThemedStyles'
import type { ThemeColors } from 'app/utils/theme'

const DISTANCE_DOWN = 60

const springConfig = {
  tension: 125,
  friction: 20
}

export type ToastType = 'info' | 'error'

const createStyles = (type: ToastType) => (themeColors: ThemeColors) => {
  let backgroundColor: string
  switch (type) {
    case 'info':
      backgroundColor = themeColors.secondary
      break
    case 'error':
      backgroundColor = themeColors.accentRed
      break
  }
  return StyleSheet.create({
    container: {
      zIndex: 50,
      alignItems: 'center',
      justifyContent: 'center'
    },
    toastView: {
      position: 'absolute',
      backgroundColor,
      borderRadius: 8
    },
    toastTextContainer: {
      paddingTop: 14,
      paddingBottom: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 16,
      paddingRight: 16
    },
    content: {
      color: themeColors.staticWhite,
      fontSize: 14
    }
  })
}

export type ToastViewProps = {
  /**
   * The content inside the toast. Can be text or component.
   */
  content: ReactNode
  /**
   * The timeout before the toast fades away
   */
  timeout: number
  /**
   * The type of toast (info, error, etc.)
   */
  type: ToastType
}

const ToastView = ({ content, timeout, type = 'info' }: ToastViewProps) => {
  const styles = useThemedStyles(createStyles(type))
  const translationAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const insets = useSafeAreaInsets()

  const animOut = useCallback(() => {
    Animated.spring(opacityAnim, {
      ...springConfig,
      toValue: 0,
      useNativeDriver: true
    }).start()
    Animated.spring(translationAnim, {
      ...springConfig,
      toValue: 0,
      useNativeDriver: true
    }).start()
  }, [translationAnim, opacityAnim])

  const animIn = useCallback(() => {
    const callback = () => {
      setTimeout(() => {
        animOut()
      }, timeout)
    }
    Animated.spring(opacityAnim, {
      ...springConfig,
      toValue: 1,
      useNativeDriver: true
    }).start()
    Animated.spring(translationAnim, {
      ...springConfig,
      toValue: Math.max(DISTANCE_DOWN, insets.top + 20),
      useNativeDriver: true
    }).start(callback)
  }, [translationAnim, opacityAnim, animOut, timeout, insets])

  useEffect(() => {
    animIn()
  }, [animIn])

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.toastView,
          {
            opacity: opacityAnim,
            transform: [
              {
                translateY: translationAnim
              }
            ]
          }
        ]}
      >
        <View style={styles.toastTextContainer}>
          <Text style={styles.content} weight={'demiBold'}>
            {content}
          </Text>
        </View>
      </Animated.View>
    </View>
  )
}

export default ToastView
