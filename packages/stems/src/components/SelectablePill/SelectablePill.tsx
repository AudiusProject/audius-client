import { forwardRef } from 'react'

import cn from 'classnames'

import styles from './SelectablePill.module.css'
import { SelectablePillProps } from './types'

export const SelectablePill = forwardRef<
  HTMLButtonElement,
  SelectablePillProps
>(
  ({
    size,
    isSelected,
    label,
    icon: IconComponent,
    onClick
  }: SelectablePillProps) => {
    const handleClick = () => {
      if (!isSelected && onClick) {
        onClick()
      }
    }

    return (
      <button
        onClick={handleClick}
        className={cn(styles.pill, {
          [styles.large]: size === 'large',
          [styles.selected]: isSelected
        })}
      >
        {IconComponent == null ? null : (
          <IconComponent
            className={cn(styles.icon, {
              [styles.iconLarge]: size === 'large'
            })}
          />
        )}
        {label}
      </button>
    )
  }
)
