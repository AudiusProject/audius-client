import { Animated, Text as RNText } from 'react-native'

import type { fontByWeight } from 'app/styles'
import { font } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

type Props = {
  children: React.ReactNode
  weight?: keyof typeof fontByWeight
} & ConstructorParameters<typeof RNText>[0]

/**
 * A custom Text component that applies the default font family and color
 * @deprecated use `import { Text } from 'app/components/core'` instead
 */
const Text = ({ children, weight = 'regular', style, ...props }: Props) => {
  const { neutral } = useThemeColors()
  return (
    <RNText style={[{ color: neutral, ...font(weight) }, style]} {...props}>
      {children}
    </RNText>
  )
}

type AnimatedProps = {
  children: React.ReactNode
  weight?: keyof typeof fontByWeight
} & Parameters<typeof Animated.Text>[0]

/**
 * A custom Animated.Text component that applies the default font family and color
 */
export const AnimatedText = ({
  children,
  weight = 'regular',
  style,
  ...props
}: AnimatedProps) => {
  const { neutral } = useThemeColors()
  return (
    <Animated.Text
      style={[{ color: neutral, ...font(weight) }, style]}
      {...props}
    >
      {children}
    </Animated.Text>
  )
}

export default Text
