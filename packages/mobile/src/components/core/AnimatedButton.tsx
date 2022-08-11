import type { ReactNode } from 'react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

import type { AnimatedLottieViewProps } from 'lottie-react-native'
import LottieView from 'lottie-react-native'
import type {
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  ViewStyle
} from 'react-native'
import { Pressable, View } from 'react-native'
import { usePrevious } from 'react-use'

import { light, medium } from 'app/haptics'
import type { GestureResponderHandler } from 'app/types/gesture'

type IconJSON = AnimatedLottieViewProps['source']

export type Haptics = boolean | 'light' | 'medium'

export type AnimatedButtonProps = {
  iconIndex?: number
  iconJSON: IconJSON | IconJSON[]
  isActive?: boolean
  isDisabled?: boolean
  onLongPress?: GestureResponderHandler
  onPress?: GestureResponderHandler
  renderUnderlay?: (state: PressableStateCallbackType) => ReactNode
  resizeMode?: AnimatedLottieViewProps['resizeMode']
  style?: PressableProps['style']
  wrapperStyle?: StyleProp<ViewStyle>
  haptics?: Haptics
  hapticsConfig?: Haptics[]
  waitForAnimationFinish?: boolean
} & PressableProps

export const AnimatedButton = ({
  iconIndex: externalIconIndex,
  iconJSON,
  isActive,
  isDisabled = false,
  onLongPress,
  onPress,
  renderUnderlay,
  resizeMode,
  style,
  wrapperStyle,
  haptics,
  hapticsConfig,
  waitForAnimationFinish,
  ...pressableProps
}: AnimatedButtonProps) => {
  const [iconIndex, setIconIndex] = useState<number>(externalIconIndex ?? 0)
  const [isPlaying, setIsPlaying] = useState(false)
  const animationRef = useRef<LottieView | null>()
  const previousExternalIconIndex = usePrevious(externalIconIndex)
  const previousActiveState = usePrevious(isActive)

  // When externalIconIndex is updated, update iconIndex
  // if animation isn't currently playing
  if (
    externalIconIndex !== undefined &&
    previousExternalIconIndex !== undefined &&
    previousExternalIconIndex !== externalIconIndex &&
    iconIndex !== externalIconIndex &&
    !isPlaying
  ) {
    setIconIndex(externalIconIndex)
  }

  const hasMultipleStates = Array.isArray(iconJSON)
  let source: IconJSON
  if (hasMultipleStates) {
    source = iconJSON[iconIndex]
  } else {
    source = iconJSON
  }

  const handleHaptics = useCallback(() => {
    const haptic = haptics ?? hapticsConfig?.[iconIndex]
    if (haptic === 'light') light()
    else if (haptic === 'medium') medium()
    else if (haptic) medium()
  }, [haptics, hapticsConfig, iconIndex])

  const handleAnimationFinish = useCallback(() => {
    if (waitForAnimationFinish) {
      onPress?.()
    }
    if (hasMultipleStates) {
      setIconIndex((iconIndex) => {
        // If externalIconIndex is provided,
        // set iconIndex to it
        if (externalIconIndex !== undefined) {
          return externalIconIndex
        }
        // Otherwise increment iconIndex
        return (iconIndex + 1) % iconJSON.length
      })
    }
    setIsPlaying(false)
  }, [
    waitForAnimationFinish,
    onPress,
    hasMultipleStates,
    setIconIndex,
    setIsPlaying,
    iconJSON,
    externalIconIndex
  ])

  const handlePress = useCallback(() => {
    handleHaptics()

    if (hasMultipleStates || !isActive) {
      setIsPlaying(true)
      animationRef.current?.play()
    }
    if (!waitForAnimationFinish) {
      onPress?.()
    }
  }, [
    handleHaptics,
    isActive,
    setIsPlaying,
    hasMultipleStates,
    animationRef,
    waitForAnimationFinish,
    onPress
  ])

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      handleHaptics()
      onLongPress()
    } else {
      handlePress()
    }
  }, [onLongPress, handleHaptics, handlePress])

  // For multi state buttons, when `isActive` flips, trigger
  // the animation to run
  useEffect(() => {
    if (hasMultipleStates) {
      if (isActive !== previousActiveState && !isPlaying) {
        setIsPlaying(true)
        animationRef.current?.play()
      }
    }
  }, [
    isActive,
    previousActiveState,
    isPlaying,
    setIsPlaying,
    hasMultipleStates,
    animationRef
  ])

  const progress = useMemo(() => {
    if (hasMultipleStates || isPlaying) {
      return undefined
    }

    return isActive ? 1 : 0
  }, [isPlaying, isActive, hasMultipleStates])

  // For binary state buttons, reset the animation
  // when not playing. This prevents the animation from getting stuck
  // in the active state when many rerenders are happening
  useEffect(() => {
    if (!hasMultipleStates && !isActive && !isPlaying) {
      animationRef.current?.reset()
    }
  }, [hasMultipleStates, isActive, isPlaying])

  return iconJSON ? (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      onPress={handlePress}
      onLongPress={handleLongPress}
      hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      style={style}
    >
      {(pressableState) => (
        <>
          {renderUnderlay?.(pressableState)}
          <View style={wrapperStyle}>
            {/* The key is needed for animations to work on android  */}
            <LottieView
              key={hasMultipleStates ? iconIndex : undefined}
              ref={(animation) => (animationRef.current = animation)}
              onAnimationFinish={handleAnimationFinish}
              progress={progress}
              loop={false}
              source={source}
              resizeMode={resizeMode}
            />
          </View>
        </>
      )}
    </Pressable>
  ) : null
}
