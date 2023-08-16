import { SVGProps } from 'react'

import { ColorValue, IconComponent, toCSSVariableName } from '@audius/stems'
import cn from 'classnames'

import styles from './Icon.module.css'

type IconSize =
  | 'xxSmall' // 12
  | 'xSmall' // 14
  | 'small' // 16
  | 'medium' // 20
  | 'large' // 24
  | 'xLarge' // 30
  | 'xxLarge' // 32

type IconProps = {
  color?: ColorValue
  icon: IconComponent
  size?: IconSize
} & SVGProps<SVGSVGElement>

/** Renders a stems Icon component
 * Ex: `<Icon icon={IconKebabHorizontal} color='accentGreen' />`
 * Use `size` to render one of the standard sizes:
 * - xSmall: 14
 * - small: 16
 * - medium: 20
 * - large: 24
 * - xLarge: 30
 * - xxLarge: 32
 */
export const Icon = (props: IconProps) => {
  const {
    className,
    color,
    icon: IconComponent,
    size = 'small',
    style: styleProp,
    ...iconProps
  } = props

  const style = color
    ? {
        ...styleProp,
        '--icon-color': `var(${toCSSVariableName(color)})`
      }
    : styleProp

  return (
    <IconComponent
      className={cn(styles.icon, styles[size], className)}
      style={style}
      {...iconProps}
    />
  )
}
