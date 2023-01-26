import { useRef, useCallback, useEffect } from 'react'

import { toastActions, toastSelectors } from '@audius/common'
import type { Toast as ToastType } from '@audius/common'
import { Animated, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import { Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

const { getToasts } = toastSelectors
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
  toastError: {
    backgroundColor: palette.accentRed
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

const Toast = (props: ToastProps) => {
  const { toast } = props
  const { content, timeout = DEFAULT_TIMEOUT, type, key } = toast
  const styles = useStyles()
  // const toastAnimation = useRef(new Animated.Value(0)).current
  const translationAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch()

  const handleDismiss = useCallback(() => {
    dispatch(dismissToast({ key }))
  }, [dispatch, key])

  const animateOut = useCallback(() => {
    Animated.spring(opacityAnim, {
      ...springConfig,
      toValue: 0,
      useNativeDriver: true
    }).start()

    Animated.spring(translationAnim, {
      ...springConfig,
      toValue: 0,
      useNativeDriver: true
    }).start(handleDismiss)
  }, [translationAnim, opacityAnim, handleDismiss])

  const animateIn = useCallback(() => {
    const callback = () => {
      setTimeout(() => {
        animateOut()
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
  }, [translationAnim, opacityAnim, animateOut, timeout, insets])

  useEffect(() => {
    animateIn()
  }, [animateIn])

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: opacityAnim,
            transform: [
              {
                translateY: translationAnim
              }
            ]
          },
          type === 'error' && styles.toastError
        ]}
      >
        <View style={styles.contentRoot}>
          <Text style={styles.content} weight={'demiBold'}>
            {content}
          </Text>
        </View>
      </Animated.View>
    </View>
  )
}

export const Toasts = () => {
  const toasts = useSelector(getToasts)

  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.key} toast={toast} />
      ))}
    </>
  )
}
