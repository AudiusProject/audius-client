import React, { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import moment from 'moment'
import cn from 'classnames'
import { make, useRecord } from 'store/analytics/actions'
import { Name } from 'services/analytics'

import { ReactComponent as IconAnnouncement } from 'assets/img/iconAnnouncement.svg'
import { ReactComponent as IconAnnouncementUnread } from 'assets/img/iconAnnouncementUnread.svg'
import { ReactComponent as IconKebabHorizontal } from 'assets/img/iconKebabHorizontal.svg'

import Menu from 'containers/menu/Menu'
import styles from './Announcement.module.css'

const messages = {
  readMore: 'Read More'
}

export type AnnouncementProps = {
  id: string
  title: string
  timestamp: string
  shortDescription: string
  longDescription?: string
  menuProps: any
  markAsRead: (id: string) => void
  setNotificationModal: (open: boolean, id: string) => void
  isRead: boolean
}

const Announcement = ({
  timestamp,
  shortDescription,
  longDescription,
  setNotificationModal,
  markAsRead,
  isRead,
  id,
  title,
  menuProps
}: AnnouncementProps) => {
  const record = useRecord()
  const displayTime = moment(timestamp).format('MMMM Do')
  const onOpenNotification = useCallback(() => {
    if (longDescription) {
      setNotificationModal(true, id)
    }
  }, [longDescription, setNotificationModal, id])

  const onContainerClick = useCallback(
    e => {
      e.stopPropagation()
      markAsRead(id)
      onOpenNotification()
      record(
        make(Name.NOTIFICATIONS_CLICK_TILE, {
          kind: 'announcement',
          link_to: ''
        })
      )
    },
    [record, markAsRead, id, onOpenNotification]
  )

  const announcementIcon = isRead ? (
    <IconAnnouncement className={styles.icon} />
  ) : (
    <IconAnnouncementUnread className={styles.icon} />
  )

  const onMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    markAsRead(id)
  }

  return (
    <div
      className={cn(styles.notification, {
        [styles.read]: isRead,
        [styles.shortDescription]: !longDescription
      })}
      onClick={onContainerClick}
    >
      <div className={styles.unReadDot}></div>
      <div className={styles.header}>
        {announcementIcon}
        <div className={styles.headerTextContainer}>
          <span className={styles.headerText}>
            <ReactMarkdown source={title} escapeHtml={false} />
          </span>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.message}>
          <ReactMarkdown source={shortDescription} escapeHtml={false} />
        </div>
        {longDescription ? (
          <div className={styles.readMore} onClick={onOpenNotification}>
            {messages.readMore}
          </div>
        ) : null}
        <div className={styles.dateMenuContainer}>
          <span className={styles.date}>{displayTime}</span>
          <div className={styles.menuContainer} onClick={onMenuClick}>
            <Menu menu={menuProps}>
              <div className={styles.iconContainer}>
                <IconKebabHorizontal className={styles.iconKebabHorizontal} />
              </div>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Announcement
