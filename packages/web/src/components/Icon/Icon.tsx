import React from 'react'

import styles from './Icon.module.css'

type IconProps = {
  /** Decorator element to be applied to the upper-right corner of the icon */
  decorator?: JSX.Element
  icon: React.FC<React.SVGProps<SVGSVGElement>>
} & React.SVGProps<SVGSVGElement>

/** Renders a stems Icon component with optional decorator
 * Ex: `<Icon icon={IconKebabHorizontal} decorator={<NotificationDot variant='small' />} />`
 */
export const Icon = ({
  decorator,
  icon: IconComponent,
  ...iconProps
}: IconProps) => {
  return decorator ? (
    <div className={styles.iconContainer}>
      <IconComponent />
      <div className={styles.iconDecoration}>{decorator}</div>
    </div>
  ) : (
    React.createElement(IconComponent, iconProps)
  )
}
