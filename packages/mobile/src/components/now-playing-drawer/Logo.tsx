import { StyleSheet, Animated } from 'react-native'

import AudiusLogoHorizontal from 'app/assets/images/audiusLogoHorizontal.svg'
import { useThemeColors } from 'app/utils/theme'

import { NOW_PLAYING_HEIGHT } from './constants'

const styles = StyleSheet.create({
  root: {
    height: 24,
    marginVertical: 8
  }
})

type LogoProps = {
  /**
   * Animation that signals how "open" the now playing drawer is.
   */
  translationAnim: Animated.Value
}

export const Logo = ({ translationAnim }: LogoProps) => {
  const { neutralLight4 } = useThemeColors()
  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: translationAnim.interpolate({
            // Interpolate the animation such that the logo fades in
            // at 25% up the screen.
            inputRange: [0, 0.75 * NOW_PLAYING_HEIGHT, NOW_PLAYING_HEIGHT],
            outputRange: [1, 0, 0],
            extrapolate: 'extend'
          })
        }
      ]}
    >
      <AudiusLogoHorizontal fill={neutralLight4} height='100%' width='100%' />
    </Animated.View>
  )
}
