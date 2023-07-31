import { forwardRef } from 'react'

import cn from 'classnames'

import styles from './HarmonySelectablePill.module.css'
import { HarmonySelectablePillProps } from './types'

export const HarmonySelectablePill = forwardRef<
  HTMLButtonElement,
  HarmonySelectablePillProps
>((props, ref) => {
  const {
    size,
    isSelected,
    label,
    icon: IconComponent,
    className,
    ...restProps
  } = props
  return (
    <button
      className={cn(
        styles.pill,
        {
          [styles.large]: size === 'large',
          [styles.selected]: isSelected
        },
        className
      )}
      ref={ref}
      {...restProps}
    >
      {IconComponent == null ? null : <IconComponent className={styles.icon} />}
      <span>{label}</span>
    </button>
  )
})
