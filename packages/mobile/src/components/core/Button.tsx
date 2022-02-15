import { ComponentType, useCallback, useState } from 'react'

import { merge } from 'lodash'
import {
  Pressable,
  Text,
  ButtonProps as RNButtonProps,
  Animated,
  PressableProps,
  ViewStyle
} from 'react-native'
import { SvgProps } from 'react-native-svg'

import { useColorAnimation } from 'app/hooks/usePressColorAnimation'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import { flexRowCentered, makeStyles, StylesProp } from 'app/styles'
import { GestureResponderHandler } from 'app/types/gesture'
import { useThemeColors } from 'app/utils/theme'

const useStyles = makeStyles(
  ({ palette, spacing, typography }, { isPressing, size, variant }) => {
    const variantStyles = {
      primary: {
        root: {
          backgroundColor: palette.primary,
          borderWidth: 0
        },
        text: {
          color: palette.white
        },
        icon: {
          color: palette.white
        }
      },
      secondary: {
        root: {
          borderColor: palette.primaryDark1,
          borderWidth: 1,
          backgroundColor: palette.white
        },
        text: {
          color: palette.primary
        },
        icon: {
          color: palette.primary
        }
      },
      common: {
        root: {
          borderColor: palette.neutral,
          borderWidth: 1,
          backgroundColor: palette.white
        },
        text: {
          color: palette.neutral
        },
        icon: {
          color: palette.neutral
        }
      }
    }

    const variantPressingStyles = {
      secondary: variantStyles.primary,
      common: variantStyles.primary
    }

    const sizeStyles = {
      medium: {
        root: {
          height: spacing(8),
          paddingHorizontal: spacing(2)
        },
        text: {
          textTransform: 'uppercase',
          fontSize: 11,
          letterSpacing: 0.5
        },
        icon: {
          height: 20,
          width: 20
        },
        iconLeft: {
          marginRight: spacing(1)
        },
        iconRight: {
          marginLeft: spacing(1)
        }
      },
      large: {
        root: {
          height: spacing(12),
          paddingHorizontal: spacing(4)
        },
        text: {
          fontSize: 18,
          letterSpacing: 0.5
        },
        icon: {
          height: 20,
          width: 20
        },
        iconLeft: {
          marginRight: spacing(2)
        },
        iconRight: {
          marginLeft: spacing(2)
        }
      }
    }

    const baseStyles = {
      root: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4
      },
      button: {
        ...flexRowCentered()
      },
      text: {
        fontFamily: typography.fontByWeight.bold
      }
    }

    return merge(
      baseStyles,
      variantStyles[variant],
      isPressing && variantPressingStyles[variant],
      sizeStyles[size]
    )
  }
)

type ButtonProps = RNButtonProps &
  PressableProps & {
    icon?: ComponentType<SvgProps>
    iconPosition?: 'left' | 'right'
    IconProps?: SvgProps
    noText?: boolean
    size?: 'small' | 'medium' | 'large'
    styles?: StylesProp<{
      root: ViewStyle
      icon: ViewStyle
    }>
    variant?: 'primary' | 'secondary' | 'common'
  }

export const Button = (props: ButtonProps) => {
  const {
    icon: Icon,
    iconPosition = 'right',
    IconProps,
    noText,
    onPressIn,
    onPressOut,
    size = 'medium',
    style,
    styles: stylesProp,
    title,
    variant = 'primary',
    ...other
  } = props

  const [isPressing, setIsPressing] = useState(false)
  const styles = useStyles({ isPressing, size, variant })
  const {
    scale,
    handlePressIn: handlePressInScale,
    handlePressOut: handlePressOutScale
  } = usePressScaleAnimation(0.97, false)

  const { primaryDark1 } = useThemeColors()

  const {
    color,
    handlePressIn: handlePressInColor,
    handlePressOut: handlePressOutColor
  } = useColorAnimation(styles.root.backgroundColor, primaryDark1)

  const handlePressIn: GestureResponderHandler = useCallback(
    event => {
      onPressIn?.(event)
      setIsPressing(true)
      handlePressInScale()
      handlePressInColor()
    },
    [onPressIn, handlePressInScale, handlePressInColor]
  )

  const handlePressOut: GestureResponderHandler = useCallback(
    event => {
      onPressOut?.(event)
      setIsPressing(false)
      handlePressOutScale()
      handlePressOutColor()
    },
    [onPressOut, handlePressOutScale, handlePressOutColor]
  )

  const icon = Icon ? (
    <Icon
      style={[
        iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
        styles.icon,
        stylesProp?.icon,
        noText && { marginLeft: 0, marginRight: 0 }
      ]}
      fill={styles.icon.color}
      {...IconProps}
    />
  ) : null

  return (
    <Animated.View
      style={[
        styles.root,
        { transform: [{ scale }], backgroundColor: color },
        style,
        stylesProp?.root
      ]}
    >
      <Pressable
        style={styles.button}
        accessibilityRole='button'
        accessibilityLabel={noText ? title : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...other}
      >
        {iconPosition !== 'left' ? null : icon}
        {noText ? null : <Text style={styles.text}>{title}</Text>}
        {iconPosition !== 'right' ? null : icon}
      </Pressable>
    </Animated.View>
  )
}
