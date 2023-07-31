import { forwardRef } from 'react'

import cn from 'classnames'

import styles from './SelectablePill.module.css'
import { SelectablePillProps } from './types'

export const SelectablePill = forwardRef<
  HTMLButtonElement,
  SelectablePillProps
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
