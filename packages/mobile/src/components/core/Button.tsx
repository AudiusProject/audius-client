import { ComponentType, useCallback, useRef, useState } from 'react'

import { merge } from 'lodash'
import {
  Pressable,
  Text,
  ButtonProps as RNButtonProps,
  Animated,
  PressableProps,
  ViewStyle,
  TextStyle,
  View,
  LayoutChangeEvent,
  GestureResponderEvent
} from 'react-native'
import { SvgProps } from 'react-native-svg'

import { light, medium } from 'app/haptics'
import { useColorAnimation } from 'app/hooks/usePressColorAnimation'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import { flexRowCentered, makeStyles, StylesProp } from 'app/styles'
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
          color: palette.staticWhite
        },
        icon: {
          color: palette.staticWhite
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
          borderColor: palette.neutralLight6,
          borderWidth: 1,
          backgroundColor: palette.white
        },
        text: {
          color: palette.neutral
        },
        icon: {
          color: palette.neutral
        }
      },
      commonAlt: {
        root: {
          borderColor: palette.neutralLight6,
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
      common: variantStyles.primary,
      commonAlt: variantStyles.commonAlt
    }

    const sizeStyles = {
      small: {
        button: {
          height: spacing(8),
          paddingHorizontal: spacing(2)
        },
        text: {
          textTransform: 'uppercase',
          fontSize: 11
        },
        icon: {
          height: spacing(5),
          width: spacing(5)
        },
        iconLeft: {
          marginRight: spacing(1)
        },
        iconRight: {
          marginLeft: spacing(1)
        }
      },
      medium: {
        button: {
          height: spacing(10),
          paddingHorizontal: spacing(10)
        },
        text: {
          fontSize: 14
        },
        icon: {
          height: spacing(6),
          width: spacing(6)
        },
        iconLeft: {
          marginRight: spacing(1)
        },
        iconRight: {
          marginLeft: spacing(1)
        }
      },
      large: {
        button: {
          height: spacing(12),
          paddingHorizontal: spacing(12)
        },
        text: {
          fontSize: 18
        },
        icon: {
          height: spacing(7),
          width: spacing(7)
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
        ...flexRowCentered(),
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 4
      },
      button: {
        ...flexRowCentered(),
        justifyContent: 'center'
      },
      text: {
        fontFamily: typography.fontByWeight.bold,
        letterSpacing: 0.5
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

export type ButtonProps = RNButtonProps &
  PressableProps & {
    icon?: ComponentType<SvgProps>
    iconPosition?: 'left' | 'right'
    IconProps?: SvgProps
    fullWidth?: boolean
    noText?: boolean
    size?: 'small' | 'medium' | 'large'
    styles?: StylesProp<{
      root: ViewStyle
      button: ViewStyle
      icon: ViewStyle
      text: TextStyle
    }>
    variant?: 'primary' | 'secondary' | 'common' | 'commonAlt'
    haptics?: boolean | 'light' | 'medium'
  }

export const Button = (props: ButtonProps) => {
  const {
    icon: Icon,
    iconPosition = 'right',
    IconProps,
    fullWidth,
    noText,
    onPress,
    onPressIn,
    onPressOut,
    size = 'medium',
    style,
    styles: stylesProp,
    title,
    variant = 'primary',
    haptics,
    ...other
  } = props
  const [isPressing, setIsPressing] = useState(false)
  const styles = useStyles({ isPressing, size, variant })
  const rootHeightRef = useRef(0)
  const {
    scale,
    handlePressIn: handlePressInScale,
    handlePressOut: handlePressOutScale
  } = usePressScaleAnimation(0.97, false)

  const { primaryDark1, neutralLight10 } = useThemeColors()

  const pressColor = {
    primary: primaryDark1,
    secondary: primaryDark1,
    common: primaryDark1,
    commonAlt: neutralLight10
  }

  const {
    color,
    handlePressIn: handlePressInColor,
    handlePressOut: handlePressOutColor
  } = useColorAnimation(styles.root.backgroundColor, pressColor[variant])

  const handlePressIn = useCallback(
    event => {
      onPressIn?.(event)
      setIsPressing(true)
      handlePressInScale()
      handlePressInColor()
    },
    [onPressIn, handlePressInScale, handlePressInColor]
  )

  const handlePressOut = useCallback(
    event => {
      onPressOut?.(event)
      setIsPressing(false)
      handlePressOutScale()
      handlePressOutColor()
    },
    [onPressOut, handlePressOutScale, handlePressOutColor]
  )

  const handleHaptics = useCallback(() => {
    if (haptics === 'light') light()
    else if (haptics === 'medium') medium()
    else if (haptics) medium()
  }, [haptics])

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      handleHaptics()
      onPress?.(e)
    },
    [handleHaptics, onPress]
  )

  // Ensures button takes up a static height even when scaling
  const handleRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      rootHeightRef.current = event.nativeEvent.layout.height
    },
    [rootHeightRef]
  )

  const icon = Icon ? (
    <Icon
      style={[
        iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
        styles.icon,
        stylesProp?.icon,
        noText && { marginLeft: 0, marginRight: 0 }
      ]}
      height={styles.icon.height}
      width={styles.icon.width}
      fill={styles.icon.color}
      {...IconProps}
    />
  ) : null

  return (
    <View
      style={rootHeightRef.current ? { height: rootHeightRef.current } : null}
      onLayout={handleRootLayout}
    >
      <Animated.View
        style={[
          styles.root,
          { transform: [{ scale }], backgroundColor: color },
          fullWidth && { width: '100%' },
          style,
          stylesProp?.root
        ]}
      >
        <Pressable
          style={[
            styles.button,
            fullWidth && { width: '100%' },
            stylesProp?.button
          ]}
          accessibilityRole='button'
          accessibilityLabel={noText ? title : undefined}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...other}
        >
          {iconPosition !== 'left' ? null : icon}
          {noText ? null : (
            <Text style={[styles.text, stylesProp?.text]}>{title}</Text>
          )}
          {iconPosition !== 'right' ? null : icon}
        </Pressable>
      </Animated.View>
    </View>
  )
}
