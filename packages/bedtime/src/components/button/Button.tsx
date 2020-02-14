import cn from 'classnames'
import { h } from 'preact'

import styles from './Button.module.css'

interface ButtonProps {
  onClick: () => void 
  icon?: JSX.Element
  label?: string
  className?: string
}

const Button = ({
  onClick,
  icon,
  label,
  className
}: ButtonProps) => {
  return (
    <div className={cn(styles.container, className)} onClick={onClick}>
      {icon}
      {label && <div>
        {label}
      </div>}
    </div>
  )
}

export default Button

