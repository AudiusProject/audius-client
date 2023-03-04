import { useEffect, useRef, useState } from 'react'

import type { ReactionTypes } from '@audius/common'
import type { AnimatedLottieViewProps } from 'lottie-react-native'
import LottieView from 'lottie-react-native'
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native'
import { Animated } from 'react-native'
import { usePrevious } from 'react-use'

import { light, medium } from 'app/haptics'
import { makeStyles } from 'app/styles'

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    height: 84,
    width: 84,
    padding: spacing(3)
  }
}))

export type ReactionStatus = 'interacting' | 'idle' | 'selected' | 'unselected'

type OnMeasureConfig = { x: number; width: number; reactionType: ReactionTypes }

export type OnMeasure = (config: OnMeasureConfig) => void

export type ReactionProps = ViewProps & {
  reactionType: ReactionTypes
  autoPlay?: boolean
  source: AnimatedLottieViewProps['source']
  style?: StyleProp<ViewStyle>
  status?: ReactionStatus
  onMeasure?: OnMeasure
  isVisible: boolean
}

export const Reaction = (props: ReactionProps) => {
  const {
    reactionType,
    autoPlay = true,
    source,
    style,
    status: statusProp = 'idle',
    onMeasure,
    isVisible,
    ...other
  } = props
  const styles = useStyles()
  const [status, setStatus] = useState(statusProp)
  const animationRef = useRef<LottieView | null>(null)
  const ref = useRef<View | null>(null)
  const scale = useRef(new Animated.Value(1)).current
  const previousStatus = usePrevious(status)

  useEffect(() => {
    setStatus(statusProp)
  }, [statusProp])

  useEffect(() => {
    if (status === 'unselected' || !isVisible) {
      animationRef.current?.pause()
    } else if (isVisible && autoPlay) {
      animationRef.current?.play()
    }
  }, [status, autoPlay, isVisible])

  // useEffect(() => {
  //   if (isVisible && onMeasure) {
  //     ref.current?.measureInWindow((x, _, width) => {
  //       onMeasure({ x, width, reactionType })
  //     })
  //   }
  // }, [isVisible, onMeasure, reactionType])

  const handleLayout = () => {
    if (isVisible && onMeasure) {
      ref.current?.measureInWindow((x, _, width) => {
        onMeasure({ x, width, reactionType })
      })
    }
  }

  useEffect(() => {
    if (previousStatus !== 'interacting' && status === 'interacting') {
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true
      }).start()
      light()
    } else if (previousStatus !== 'selected' && status === 'selected') {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true
        })
      ]).start()
      medium()
    } else if (previousStatus !== status && status !== 'selected') {
      Animated.timing(scale, {
        toValue: 1,
        duration: 70,
        useNativeDriver: true
      }).start()
    }
  })

  const animatedStyles = {
    transform: [{ scale }],
    opacity: status === 'unselected' ? 0.3 : 1
  }

  return (
    <Animated.View
      ref={ref}
      style={[styles.root, animatedStyles, style]}
      {...other}
    >
      <LottieView
        ref={(animation) => {
          animationRef.current = animation
        }}
        onLayout={handleLayout}
        autoPlay={isVisible && autoPlay}
        loop
        source={source}
      />
    </Animated.View>
  )
}
