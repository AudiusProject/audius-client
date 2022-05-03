import React, { ReactNode } from 'react'

import { ReactComponent as IconHeart } from 'assets/img/iconHeart.svg'
import { ReactComponent as IconRepostBase } from 'assets/img/iconRepost.svg'
import { ReactComponent as IconTrophy } from 'assets/img/iconTrophy.svg'
import { ReactComponent as IconUser } from 'assets/img/iconUser.svg'

import styles from './icons.module.css'

export const IconFollow = () => {
  return <IconUser className={styles.iconFollow} />
}

export const IconRepost = () => {
  return <IconRepostBase className={styles.iconRepost} />
}

export const IconFavorite = () => {
  return <IconHeart className={styles.iconFavorite} />
}

export const IconMilestone = () => {
  return <IconTrophy className={styles.iconMilestone} />
}

export const IconRelease = () => {
  return <IconTrophy className={styles.iconMilestone} />
}

export const IconRewards = ({ children }: { children: ReactNode }) => (
  <span className={styles.iconRewards}>{children}</span>
)
