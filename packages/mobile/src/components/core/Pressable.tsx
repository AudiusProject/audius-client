import { useCallback, useRef } from 'react'

import {
  GestureResponderEvent,
  Pressable as RNPressable,
  PressableProps as RNPressableProps
} from 'react-native'

type PressableProps = RNPressableProps

type TouchPosition = { pageX: number; pageY: number }

export const Pressable = (props: PressableProps) => {
  const { onPress, onPressIn, ...other } = props

  const activeTouchPositionRef = useRef<TouchPosition | null>(null)

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      const { pageX, pageY } = event.nativeEvent

      activeTouchPositionRef.current = {
        pageX,
        pageY
      }

      onPressIn?.(event)
    },
    [onPressIn]
  )

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (!activeTouchPositionRef.current) return

      const { pageX, pageY } = event.nativeEvent

      const absX = Math.abs(activeTouchPositionRef.current.pageX - pageX)
      const absY = Math.abs(activeTouchPositionRef.current.pageY - pageY)

      const dragged = absX > 2 || absY > 2
      if (!dragged) {
        onPress?.(event)
      }
    },
    [onPress]
  )

  return (
    <RNPressable onPress={handlePress} onPressIn={handlePressIn} {...other} />
  )
}
