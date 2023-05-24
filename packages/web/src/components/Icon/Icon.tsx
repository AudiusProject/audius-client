import React from 'react'

import styles from './Icon.module.css'

type IconProps = {
  decorator?: JSX.Element
  icon: React.FC<React.SVGProps<SVGSVGElement>>
} & React.SVGProps<SVGSVGElement>

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
