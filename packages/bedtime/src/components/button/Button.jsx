import cn from 'classnames'
import { h } from 'preact'

import styles from './Button.module.css'

// TODO: proptypes
// interface ButtonProps {
//   onClick: () => void
//   icon?: JSX.Element
//   label?: string
//   className?: string
// }

const Button = ({
  onClick,
  icon,
  label,
  className,
  disabled
}) => {
  const wrappedOnClick = () => {
    !disabled && onClick()
  }

  console.log( {disabled })

  return (
    <div className={cn(styles.container, { [styles.disabled]: disabled }, className)} onClick={wrappedOnClick}>
      {label && <div>
        {label}
      </div>}
      {icon}
    </div>
  )
}

export default Button

