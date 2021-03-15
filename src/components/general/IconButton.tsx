import React, { ReactNode } from 'react'
import cn from 'classnames'

import styles from './IconButton.module.css'

type IconButtonProps = {
  onClick?: (event: React.MouseEvent) => void
  disabled?: boolean
  className?: string
  isActive?: boolean
  activeClassName?: string
  icon: ReactNode
}

// A button that is just an icon, no text.
const IconButton = ({
  onClick,
  className,
  isActive,
  activeClassName,
  icon,
  disabled = false
}: IconButtonProps) => {
  const handleClick = (event: React.MouseEvent) => {
    if (!disabled && onClick) {
      onClick(event)
    }
  }

  return (
    <div
      className={cn(
        styles.container,
        className,
        { [activeClassName || '']: isActive },
        { [styles.disabled]: disabled }
      )}
      onClick={handleClick}
    >
      {icon}
    </div>
  )
}

export default IconButton
