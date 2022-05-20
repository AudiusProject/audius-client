import { useMemo } from 'react'

import { Text as RNText, TextProps as RNTextProps } from 'react-native'

import { FontSize, FontWeight, makeStyles, typography } from 'app/styles'

export type TextProps = RNTextProps & {
  variant?: keyof typeof typography
  noGutter?: boolean
  color?: 'primary' | 'secondary' | 'neutral' | 'neutralLight4'
  weight?: FontWeight
  fontSize?: FontSize
}

const useStyles = makeStyles(
  (
    { typography, palette },
    { variant, noGutter, color, weight, fontSize }
  ) => ({
    root: {
      ...typography[variant],
      color: palette[color],
      ...(weight ? { fontFamily: typography.fontByWeight[weight] } : null),
      fontSize: typography.fontSize[fontSize],
      ...(noGutter && { marginBottom: 0 })
    }
  })
)

export const Text = (props: TextProps) => {
  const {
    variant = 'body',
    noGutter,
    style,
    color = 'neutral',
    weight,
    fontSize = 'medium',
    ...other
  } = props

  const styleOptions = useMemo(
    () => ({ variant, noGutter, color, weight, fontSize }),
    [variant, noGutter, color, weight, fontSize]
  )

  const styles = useStyles(styleOptions)

  return <RNText style={[styles.root, style]} {...other} />
}
