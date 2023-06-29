import { IconLock, IconLockUnlocked } from '@audius/stems'
import cn from 'classnames'

import styles from './LockedStatusBadge.module.css'

export type LockedStatusBadgeProps = {
  locked: boolean
}

export const LockedStatusBadge = ({ locked }: LockedStatusBadgeProps) => {
  const LockComponent = locked ? IconLock : IconLockUnlocked
  return (
    <div
      className={cn(styles.container, locked ? styles.locked : styles.unlocked)}
    >
      <LockComponent className={styles.icon} />
    </div>
  )
}
