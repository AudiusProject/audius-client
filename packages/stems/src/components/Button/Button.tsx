import { CSSProperties, forwardRef } from 'react'

import cn from 'classnames'

import { useMediaQueryListener } from 'hooks/useMediaQueryListener'
import { CSSCustomProperties } from 'styles/types'
import { toCSSVariableName } from 'utils/styles'

import styles from './Button.module.css'
import { ButtonProps, Type, Size } from './types'

const SIZE_STYLE_MAP = {
  [Size.TINY]: styles.tiny,
  [Size.SMALL]: styles.small,
  [Size.MEDIUM]: styles.medium,
  [Size.LARGE]: styles.large
}

const TYPE_STYLE_MAP = {
  [Type.PRIMARY]: styles.primary,
  [Type.PRIMARY_ALT]: styles.primaryAlt,
  [Type.SECONDARY]: styles.secondary,
  [Type.TERTIARY]: styles.tertiary,
  [Type.COMMON]: styles.common,
  [Type.COMMON_ALT]: styles.commonAlt,
  [Type.DISABLED]: styles.disabled,
  [Type.GLASS]: styles.glass,
  [Type.WHITE]: styles.white,
  [Type.TEXT]: styles.textButton,
  [Type.DESTRUCTIVE]: styles.destructive
}

/**
 * A common Button component. Includes a few variants and options to
 * include and position icons.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      color,
      text,
      type = Type.PRIMARY,
      buttonType,
      size = Size.MEDIUM,
      leftIcon,
      rightIcon,
      isDisabled,
      disabled: disabledProp,
      includeHoverAnimations = true,
      widthToHideText,
      minWidth,
      className,
      iconClassName,
      textClassName,
      'aria-label': ariaLabelProp,
      fullWidth,
      ...other
    },
    ref
  ) {
    const { isMatch: textIsHidden } = useMediaQueryListener(
      `(max-width: ${widthToHideText}px)`
    )
    const disabled = disabledProp ?? isDisabled
    const isTextVisible = !!text && !textIsHidden

    const renderLeftIcon = () =>
      leftIcon && (
        <span
          className={cn(iconClassName, styles.icon, styles.left, {
            [styles.noText]: !isTextVisible
          })}
        >
          {leftIcon}
        </span>
      )

    const renderRightIcon = () =>
      rightIcon && (
        <span
          className={cn(iconClassName, styles.icon, styles.right, {
            [styles.noText]: !isTextVisible
          })}
        >
          {rightIcon}
        </span>
      )

    const getAriaLabel = () => {
      if (ariaLabelProp) return ariaLabelProp
      // Use the text prop as the aria-label if the text becomes hidden
      // and no aria-label was provided to keep the button accessible.
      else if (textIsHidden && typeof text === 'string') return text
      return undefined
    }

    const renderText = () =>
      isTextVisible && (
        <span className={cn(styles.textLabel, textClassName)}>{text}</span>
      )

    const style: CSSCustomProperties = {
      minWidth: minWidth && isTextVisible ? `${minWidth}px` : 'unset',
      '--button-color': color ? `var(${toCSSVariableName(color)})` : undefined
    }

    return (
      <button
        aria-label={getAriaLabel()}
        className={cn(
          styles.button,
          SIZE_STYLE_MAP[size || Size.MEDIUM],
          TYPE_STYLE_MAP[type || Type.COMMON],
          {
            [styles.noIcon]: !leftIcon && !rightIcon,
            [styles.disabled]: disabled,
            [styles.includeHoverAnimations]: includeHoverAnimations,
            [styles.fullWidth]: fullWidth
          },
          className
        )}
        disabled={disabled}
        type={buttonType}
        ref={ref}
        style={style as CSSProperties}
        {...other}
      >
        {color ? <span className={styles.overlay} /> : null}
        {renderLeftIcon()}
        {renderText()}
        {renderRightIcon()}
      </button>
    )
  }
)
