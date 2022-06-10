import React, { ReactNode } from 'react'

import styles from './ProfileNavTitle.module.css'

type ProfileNavTitleProps = {
  title?: string
  titleIcon?: ReactNode
}

export const ProfileNavTitle = ({ title, titleIcon }: ProfileNavTitleProps) => (
  <div className={styles.titleContainer}>
    <div className={styles.titleAndIcon}>
      {titleIcon}
      {title ? <span className={styles.title}>{title}</span> : null}
    </div>
    <span className={styles.line} />
  </div>
)
