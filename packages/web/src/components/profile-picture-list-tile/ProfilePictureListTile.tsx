import React, { ReactNode } from 'react'

import { IconArrow } from '@audius/stems'

import {
  UserProfileListProps,
  UserProfilePictureList
} from 'components/notification/Notification/components/UserProfilePictureList'
import { USER_LENGTH_LIMIT } from 'components/notification/Notification/utils'

import styles from './ProfilePictureListTile.module.css'

const messages = {
  viewAll: 'View All'
}

type ProfilePictureListTitleProps = {
  title?: string
  titleIcon?: ReactNode
}

export const ProfilePictureListTitle = ({
  title,
  titleIcon
}: ProfilePictureListTitleProps) => (
  <div className={styles.titleContainer}>
    <div className={styles.titleAndIcon}>
      {titleIcon}
      {title ? <span className={styles.title}>{title}</span> : null}
    </div>
    <span className={styles.line} />
  </div>
)

type ProfilePictureListTileProps = UserProfileListProps & {
  onClick: () => void
  title?: string
  titleIcon?: ReactNode
  className?: string
}
export const ProfilePictureListTile = ({
  onClick,
  title,
  titleIcon,
  className,
  users,
  totalUserCount,
  limit = USER_LENGTH_LIMIT,
  disableProfileClick,
  disablePopover,
  stopPropagation,
  profilePictureClassname
}: ProfilePictureListTileProps) => {
  return (
    <div className={className}>
      {title || titleIcon ? (
        <ProfilePictureListTitle title={title} titleIcon={titleIcon} />
      ) : null}
      <div className={styles.tileContainer} onClick={onClick}>
        <UserProfilePictureList
          users={users}
          totalUserCount={totalUserCount}
          limit={limit}
          disableProfileClick={disableProfileClick}
          disablePopover={disablePopover}
          stopPropagation={stopPropagation}
          profilePictureClassname={profilePictureClassname}
        />
        <div className={styles.viewAll}>
          <span>{messages.viewAll}</span>
          <IconArrow className={styles.arrowIcon} />
        </div>
      </div>
    </div>
  )
}
