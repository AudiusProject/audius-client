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
  ({ typography, palette, spacing }, { variant, isPressing }) => {
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

    const baseStyles = {
      root: {
        borderRadius: 4,
        height: spacing(8),
        paddingHorizontal: spacing(2),
        justifyContent: 'center',
        alignItems: 'center'
      },
      button: {
        ...flexRowCentered()
      },
      text: {
        fontSize: 11,
        fontFamily: typography.fontByWeight.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5
      },
      iconLeft: {
        marginRight: spacing(1)
      },
      iconRight: {
        marginLeft: spacing(1)
      }
    }

    return merge(
      baseStyles,
      variantStyles[variant],
      isPressing && variantPressingStyles[variant]
    )
  }
)

type ButtonProps = RNButtonProps &
  PressableProps & {
    icon?: ComponentType<SvgProps>
    iconPosition?: 'left' | 'right'
    variant: 'primary' | 'secondary' | 'common'
    noText?: boolean
    styles?: StylesProp<{
      root: ViewStyle
      icon: ViewStyle
    }>
    IconProps?: SvgProps
  }

export const Button = (props: ButtonProps) => {
  const {
    title,
    icon: Icon,
    iconPosition = 'right',
    variant,
    onPressIn,
    onPressOut,
    noText,
    style,
    styles: stylesProp,
    IconProps,
    ...other
  } = props

  const [isPressing, setIsPressing] = useState(false)
  const styles = useStyles({ variant, isPressing })
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
      height={20}
      width={20}
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
