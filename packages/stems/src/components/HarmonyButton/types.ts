import { ComponentPropsWithoutRef, ReactNode } from 'react'

import { ColorValue } from 'styles/colors'

export enum HarmonyButtonType {
  DEFAULT = 'default',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  DESTRUCTIVE = 'destructive',
  GHOST = 'ghost'
}

export enum HarmonyButtonSize {
  SMALL = 'small',
  DEFAULT = 'default',
  LARGE = 'large'
}

type BaseButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'>

export type HarmonyButtonProps = {
  color?: ColorValue
  /**
   * The text of the button
   */
  text: ReactNode

  /**
   * The type of the button
   */
  variant?: HarmonyButtonType

  /**
   * The button size
   */
  size?: HarmonyButtonSize

  /**
   * Optional icon element to include on the left side of the button
   */
  leftIcon?: ReactNode | JSX.Element

  /**
   * Optional icon element to include on the right side of the button
   */
  rightIcon?: ReactNode | JSX.Element

  /**
   * Whether or not to include animations on hover
   * Consider turning off animations in mobile-first experiences
   */
  includeHoverAnimations?: boolean

  /**
   * The max width at which text will still be shown
   */
  widthToHideText?: number

  /**
   * Optional min width
   * Min width can be useful if the button is switching states and you want
   * to keep a certain width while text length changes
   */
  minWidth?: number

  /**
   * If provided, allow button to take up full width of container
   */
  fullWidth?: boolean

  /**
   * Class name to apply to the icon
   */
  iconClassName?: string

  /**
   * Class name to apply to the text label
   */
  textClassName?: string
} & BaseButtonProps
