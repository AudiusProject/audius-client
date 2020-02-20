import cn from 'classnames'
import React, { ReactNode } from 'react'

import styles from './Toast.module.css'

// TODO: props
// interface ToastProps {
//   children?: JSX.Element
//   text: ReactNode
//   disabled?: boolean
//   top?: number
//   delay?: number
//   containerClassName?: string
//   stopClickPropagation?: boolean
//   // Whether or not this toast is controlled by the parent or not
//   isControlled?: boolean
//   isOpen?: boolean
// }

export const Toast = ({
  children,
  text,
  containerClassName,
}) => {
  return (
    <div className={styles.container}>
      {text}
    </div>
  )
}

export default Toast
