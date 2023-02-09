import { useRef, useCallback, useEffect } from 'react'

import { toastActions } from '@audius/common'
import type { Toast as ToastType } from '@audius/common'
import { Animated, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'

import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

const { dismissToast } = toastActions

const DEFAULT_TIMEOUT = 2000
const DISTANCE_DOWN = 60

const springConfig = {
  tension: 125,
  friction: 20
}

const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  toast: {
    position: 'absolute',
    backgroundColor: palette.secondary,
    borderRadius: 8
  },
  contentRoot: {
    paddingTop: spacing(3) + 2,
    paddingBottom: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: spacing(4),
    paddingRight: spacing(4)
  },
  content: {
    color: palette.staticWhite,
    fontSize: 14
  }
}))

type ToastProps = {
  toast: ToastType
}

export const Toast = (props: ToastProps) => {
  const { toast } = props
  const { content, timeout = DEFAULT_TIMEOUT, type, key } = toast
  const styles = useStyles()
  const toastAnimation = useRef(new Animated.Value(0))
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch()

  const handleDismiss = useCallback(() => {
    dispatch(dismissToast({ key }))
  }, [dispatch, key])

  const animateOut = useCallback(() => {
    Animated.spring(toastAnimation.current, {
      ...springConfig,
      toValue: 0,
      useNativeDriver: true
    }).start(handleDismiss)
  }, [handleDismiss])

  const animateIn = useCallback(() => {
    Animated.spring(toastAnimation.current, {
      ...springConfig,
      toValue: 1,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        animateOut()
      }, timeout)
    })
  }, [animateOut, timeout])

  useEffect(() => {
    animateIn()
  }, [animateIn])

  const opacityStyle = toastAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  })

  const translateYStyle = toastAnimation.current.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(DISTANCE_DOWN, insets.top + 20)]
  })

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: opacityStyle,
            transform: [{ translateY: translateYStyle }]
          }
        ]}
      >
        <View style={styles.contentRoot}>
          <Text style={styles.content} weight='demiBold'>
            {content}
          </Text>
        </View>
      </Animated.View>
    </View>
  )
}
