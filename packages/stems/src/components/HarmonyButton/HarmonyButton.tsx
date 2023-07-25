import { CSSProperties, forwardRef } from 'react'

import cn from 'classnames'

import { useMediaQueryListener } from 'hooks/useMediaQueryListener'
import { CSSCustomProperties } from 'styles/types'
import { toCSSVariableName } from 'utils/styles'

import styles from './HarmonyButton.module.css'
import {
  HarmonyButtonProps,
  HarmonyButtonType,
  HarmonyButtonSize
} from './types'

const SIZE_STYLE_MAP: { [k in HarmonyButtonSize]: string } = {
  [HarmonyButtonSize.SMALL]: styles.small,
  [HarmonyButtonSize.DEFAULT]: styles.default,
  [HarmonyButtonSize.LARGE]: styles.large
}

const TYPE_STYLE_MAP: { [k in HarmonyButtonType]: string } = {
  [HarmonyButtonType.PRIMARY]: styles.primary,
  [HarmonyButtonType.SECONDARY]: styles.secondary,
  [HarmonyButtonType.TERTIARY]: styles.tertiary,
  [HarmonyButtonType.DESTRUCTIVE]: styles.destructive,
  [HarmonyButtonType.GHOST]: styles.ghost
}

/**
 * A common Button component. Includes a few variants and options to
 * include and position icons.
 */
export const HarmonyButton = forwardRef<HTMLButtonElement, HarmonyButtonProps>(
  function Button(
    {
      color,
      text,
      variant = HarmonyButtonType.PRIMARY,
      size = HarmonyButtonSize.DEFAULT,
      leftIcon: LeftIconComponent,
      rightIcon: RightIconComponent,
      disabled,
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

    const isTextVisible = !!text && !textIsHidden

    const getAriaLabel = () => {
      if (ariaLabelProp) return ariaLabelProp
      // Use the text prop as the aria-label if the text becomes hidden
      // and no aria-label was provided to keep the button accessible.
      else if (textIsHidden && typeof text === 'string') return text
      return undefined
    }

    const style: CSSCustomProperties = {
      minWidth: minWidth && isTextVisible ? `${minWidth}px` : 'unset',
      '--button-color':
        !disabled && color ? `var(${toCSSVariableName(color)})` : undefined
    }

    return (
      <button
        aria-label={getAriaLabel()}
        className={cn(
          styles.button,
          SIZE_STYLE_MAP[size],
          TYPE_STYLE_MAP[variant],
          {
            [styles.disabled]: disabled,
            [styles.fullWidth]: fullWidth
          },
          className
        )}
        disabled={disabled}
        ref={ref}
        style={style as CSSProperties}
        {...other}
      >
        {LeftIconComponent ? (
          <LeftIconComponent className={cn(iconClassName, styles.icon)} />
        ) : null}
        {isTextVisible ? (
          <span className={cn(styles.text, textClassName)}>{text}</span>
        ) : null}
        {RightIconComponent ? (
          <RightIconComponent className={cn(iconClassName, styles.icon)} />
        ) : null}
      </button>
    )
  }
)
