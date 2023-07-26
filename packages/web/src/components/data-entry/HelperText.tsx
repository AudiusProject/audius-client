import { ReactNode } from 'react'

import cn from 'classnames'

import styles from './HelperText.module.css'

type HelperTextProps = {
  children: ReactNode
  error?: boolean
}

export const HelperText = (props: HelperTextProps) => {
  const { children, error } = props
  return (
    <div className={styles.root}>
      <span className={cn(styles.text, { [styles.error]: error })}>
        {children}
      </span>
    </div>
  )
}
