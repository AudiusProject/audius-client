import { useCallback, useRef } from 'react'

import LottieView from 'lottie-react-native'
import type AnimatedLottieView from 'lottie-react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet } from 'react-native'

import loadingSpinner from 'app/assets/animations/loadingSpinner.json'
import { useEnterForeground } from 'app/hooks/useAppState'
import { useThemeColors } from 'app/utils/theme'

const styles = StyleSheet.create({
  spinner: {
    height: 24,
    width: 24
  }
})

type LoadingSpinnerProps = {
  /**
   * @deprecated The color of the spinner
   */
  color?: string
  /**
   * Fill color of the spinner
   */
  fill?: string
  /**
   * Style to apply to the spinner
   */
  style?: StyleProp<ViewStyle>
}

const LoadingSpinner = (props: LoadingSpinnerProps) => {
  const { neutralLight4 } = useThemeColors()
  const color = props.color ?? props.fill ?? neutralLight4
  const ref = useRef<AnimatedLottieView>(null)

  // Fix paused animation when entering foreground
  // see: https://github.com/lottie-react-native/lottie-react-native/issues/412
  useEnterForeground(
    useCallback(() => {
      ref.current?.play()
    }, [])
  )

  return (
    <LottieView
      ref={ref}
      style={[styles.spinner, props.style]}
      source={loadingSpinner}
      autoPlay
      loop
      colorFilters={[
        {
          keypath: 'Shape Layer 1',
          color
        },
        {
          keypath: 'Shape Layer 2',
          color
        }
      ]}
    />
  )
}

export default LoadingSpinner
