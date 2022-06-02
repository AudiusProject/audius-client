import { useContext, useEffect, useRef, useState } from 'react'

import LottieView, { AnimatedLottieViewProps } from 'lottie-react-native'
import {
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle
} from 'react-native'

import { spacing } from 'app/styles/spacing'

import { NotificationsDrawerNavigationContext } from '../NotificationsDrawerNavigationContext'

export type ReactionStatus = 'interacting' | 'idle' | 'selected' | 'unselected'

export type ReactionProps = PressableProps & {
  source: AnimatedLottieViewProps['source']
  style?: StyleProp<ViewStyle>
  status?: ReactionStatus
  onMeasure?: (values: { x: number; width: number }) => void
}

export const Reaction = (props: ReactionProps) => {
  const {
    source,
    style,
    status: statusProp = 'idle',
    onMeasure,
    ...other
  } = props
  const [status, setStatus] = useState(statusProp)
  const animationRef = useRef<LottieView | null>(null)
  const ref = useRef<View | null>(null)
  const { state } = useContext(NotificationsDrawerNavigationContext)

  const isOpen = state?.history.length === 2

  const size =
    status === 'interacting'
      ? { height: 72, width: 72 }
      : { height: 72, width: 72 }

  const backgroundColor =
    status === 'unselected'
      ? 'gray'
      : status === 'interacting'
      ? 'blue'
      : undefined

  useEffect(() => {
    setStatus(statusProp)
  }, [statusProp])

  useEffect(() => {
    if (status === 'unselected') {
      animationRef.current?.pause()
    } else {
      animationRef.current?.play()
    }
  }, [status])

  useEffect(() => {
    if (ref.current && isOpen) {
      // We need to wait until drawer finishes opening before calculating
      // layout, otherwise we calculate off-screen values
      setTimeout(() => {
        ref.current?.measureInWindow((x, _, width) => {
          onMeasure?.({ x, width })
        })
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onMeasure changes too much
  }, [ref, isOpen])

  return (
    <View ref={ref}>
      <Pressable
        style={[{ ...size, marginRight: spacing(2), backgroundColor }, style]}
        {...other}
      >
        <LottieView
          ref={animation => {
            animationRef.current = animation
          }}
          autoPlay
          loop
          source={source}
        />
      </Pressable>
    </View>
  )
}
