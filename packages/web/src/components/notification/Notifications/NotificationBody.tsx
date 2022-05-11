import React, { ReactNode } from 'react'

import cn from 'classnames'

import styles from './NotificationBody.module.css'

type NotificationBodyProps = {
  className?: string
  children: ReactNode
}

export const NotificationBody = (props: NotificationBodyProps) => {
  const { className, children } = props

  return <span className={cn(styles.root, className)}>{children}</span>
}
