import React, { ReactNode } from 'react'

import styles from './NotificationTitle.module.css'

type NotificationTitleProps = {
  children: ReactNode
}

export const NotificationTitle = ({ children }: NotificationTitleProps) => {
  return <h3 className={styles.root}>{children}</h3>
}
