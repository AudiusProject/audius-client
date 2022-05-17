import React from 'react'

import { ID } from 'common/models/Identifiers'
import { User } from 'common/models/User'
import { formatCount } from 'common/utils/formatUtil'
import Tooltip from 'components/tooltip/Tooltip'

import { USER_LENGTH_LIMIT } from '../utils'

import { ProfilePicture } from './ProfilePicture'
import styles from './UserProfilePictureList.module.css'

const messages = {
  viewAllTooltip: 'View All'
}

type UserProfileListProps = {
  users: Array<User>
  limit?: number
  totalOverride?: number
}

export const UserProfilePictureList = ({
  users,
  limit = USER_LENGTH_LIMIT,
  totalOverride
}: UserProfileListProps) => {
  const showUserListModal = totalOverride
    ? totalOverride > limit
    : users.length > limit
  const remainingUsersCount = totalOverride
    ? totalOverride - limit
    : users.length - limit

  return (
    <div className={styles.root}>
      {users
        .filter(u => !u.is_deactivated)
        .slice(0, limit)
        .map(user => (
          <ProfilePicture
            key={user.user_id}
            className={styles.profilePicture}
            user={user}
          />
        ))}
      {showUserListModal ? (
        <Tooltip text={messages.viewAllTooltip}>
          <div className={styles.profilePictureExtraRoot}>
            <ProfilePicture
              disablePopover
              className={styles.profilePictureExtra}
              user={users[USER_LENGTH_LIMIT]}
            />
            <span className={styles.profilePictureCount}>
              {`+${formatCount(remainingUsersCount)}`}
            </span>
          </div>
        </Tooltip>
      ) : null}
    </div>
  )
}
