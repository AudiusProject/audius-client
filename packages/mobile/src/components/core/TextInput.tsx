import type { ComponentType, ReactElement } from 'react'
import { useState, useRef, forwardRef, useCallback } from 'react'

import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps as RNTextInputProps,
  TextStyle,
  ViewStyle
} from 'react-native'
import {
  Animated,
  TextInput as RNTextInput,
  View,
  Pressable
} from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import type { SvgProps } from 'react-native-svg'

import IconClose from 'app/assets/images/iconRemove.svg'
import { usePressScaleAnimation } from 'app/hooks/usePressScaleAnimation'
import type { StylesProp } from 'app/styles'
import { makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { mergeRefs } from 'app/utils/mergeRefs'

import { Text } from './Text'

const useStyles = makeStyles(({ typography, palette, spacing }) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: spacing(2),
    paddingLeft: spacing(3),
    paddingRight: spacing(2),
    borderColor: palette.neutralLight7,
    backgroundColor: palette.neutralLight10
  },
  labelRoot: {
    paddingTop: spacing(8),
    paddingBottom: spacing(3)
    // paddingBottom: 0
    // height: spacing(16)
  },
  label: {
    position: 'absolute',
    left: spacing(3),
    top: spacing(2)
  },
  labelText: {
    color: palette.neutral,
    fontFamily: typography.fontByWeight.medium
  },
  labelTextInactive: {
    fontSize: 18
  },
  labelTextActive: {
    fontSize: 16,
    color: palette.neutralLight4
  },
  input: {
    flex: 1,
    color: palette.neutral,
    fontFamily: typography.fontByWeight.medium
  },
  icon: {
    fill: palette.neutralLight5,
    height: spacing(4),
    width: spacing(4)
  },
  placeholderText: {
    color: palette.neutralLight4
  },
  endAdornment: {
    position: 'absolute',
    right: spacing(4),
    bottom: spacing(4)
  }
}))

export type TextInputProps = RNTextInputProps & {
  label?: string
  /**
   * Default icon to show at the right side of the input
   */
  Icon?: ComponentType<SvgProps>
  endAdornment?: ReactElement
  /**
   * Whether or not the search input should show a clear icon
   */
  clearable?: boolean
  /**
   * What happens when the user clicks the clear icon
   */
  onClear?: () => void
  styles?: StylesProp<{
    root: ViewStyle
    input: TextStyle
    labelText: TextStyle
  }>
}

export type TextInputRef = RNTextInput

const activeLabelY = 0
const inactiveLabelY = spacing(3)

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (props, ref) => {
    const { scale, handlePressIn, handlePressOut } = usePressScaleAnimation(0.8)
    const innerInputRef = useRef()

    const {
      style,
      styles: stylesProp,
      label,
      Icon,
      clearable,
      onClear,
      endAdornment,
      value,
      onFocus,
      onBlur,
      ...other
    } = props
    const { autoFocus } = other
    const styles = useStyles()

    const [isFocused, setIsFocused] = useState(Boolean(autoFocus))
    const isLabelActive = isFocused || value
    const labelY = useRef(
      new Animated.Value(isLabelActive ? activeLabelY : inactiveLabelY)
    )

    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        onFocus?.(e)
        setIsFocused(true)

        if (!isLabelActive) {
          Animated.spring(labelY.current, {
            toValue: activeLabelY,
            useNativeDriver: false
          }).start()
        }
      },
      [onFocus, isLabelActive]
    )

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        onBlur?.(e)
        setIsFocused(false)

        if (isFocused && !value) {
          Animated.spring(labelY.current, {
            toValue: inactiveLabelY,
            useNativeDriver: false
          }).start()
        }
      },
      [onBlur, isFocused, value]
    )

    const handlePressRoot = useCallback(() => {
      if (!isFocused) {
        innerInputRef.current?.focus()
      }
    }, [isFocused])

    const handlePressIcon = useCallback(() => {
      onClear?.()
    }, [onClear])

    return (
      <Pressable style={{ flex: 1 }} onPress={handlePressRoot}>
        <View
          style={[
            styles.root,
            label ? styles.labelRoot : undefined,
            style,
            stylesProp?.root
          ]}
        >
          {label ? (
            <Animated.View
              style={[
                styles.label,
                { transform: [{ translateY: labelY.current }] }
              ]}
            >
              <Text
                style={[
                  styles.labelText,
                  stylesProp?.labelText,
                  isLabelActive
                    ? styles.labelTextActive
                    : styles.labelTextInactive
                ]}
              >
                {label}
              </Text>
            </Animated.View>
          ) : null}
          <RNTextInput
            ref={mergeRefs([innerInputRef, ref])}
            style={[styles.input, stylesProp?.input]}
            underlineColorAndroid='transparent'
            autoComplete='off'
            autoCorrect={false}
            returnKeyType='search'
            placeholderTextColor={styles.placeholderText.color}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...other}
          />
          {clearable ? (
            <Animated.View style={[{ transform: [{ scale }] }]}>
              <TouchableWithoutFeedback
                onPress={handlePressIcon}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                hitSlop={{
                  top: spacing(2),
                  bottom: spacing(2),
                  left: spacing(2),
                  right: spacing(2)
                }}
              >
                <IconClose
                  style={{
                    height: styles.icon.height,
                    width: styles.icon.width
                  }}
                  fill={styles.icon.fill}
                  height={styles.icon.height}
                  width={styles.icon.width}
                />
              </TouchableWithoutFeedback>
            </Animated.View>
          ) : Icon ? (
            <Icon
              style={{ height: styles.icon.height, width: styles.icon.width }}
              fill={styles.icon.fill}
              height={styles.icon.height}
              width={styles.icon.width}
            />
          ) : null}
          {endAdornment ? (
            <View style={styles.endAdornment}>{endAdornment}</View>
          ) : null}
        </View>
      </Pressable>
    )
  }
)
