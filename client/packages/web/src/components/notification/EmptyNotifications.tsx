import { ReactComponent as IconAnnouncement } from 'assets/img/iconAnnouncement.svg'

import styles from './EmptyNotifications.module.css'

const messages = {
  empty: 'There’s Nothing Here Yet!'
}

export const EmptyNotifications = () => {
  return (
    <div className={styles.emptyContainer}>
      <IconAnnouncement className={styles.icon} />
      <div className={styles.emptyMessage}>{messages.empty}</div>
    </div>
  )
}
