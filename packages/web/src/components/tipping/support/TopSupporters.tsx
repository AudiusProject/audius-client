import React, { MouseEvent, useCallback } from 'react'

import { IconTrophy, IconArrow } from '@audius/stems'
import cn from 'classnames'

import { useSelector } from 'common/hooks/useSelector'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSupporters } from 'common/store/tipping/selectors'
import { UserProfilePictureList } from 'components/notification/Notifications/UserProfilePictureList'

import styles from './Support.module.css'

const MAX_TOP_SUPPORTERS = 5

const messages = {
  topSupporters: 'Top Supporters',
  viewAll: 'View All'
}

export const TopSupporters = () => {
  const profile = useSelector(getProfileUser)
  const supportersMap = useSelector(getSupporters)
  const supportersList = profile ? supportersMap[profile.user_id] ?? [] : []

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    const className = (target?.className ?? '').toString()
    const isProfilePicture = className.includes('ProfilePicture_profilePicture')
    // console.log(isProfilePicture, { hi: event.target, isProfilePicture })
    // todo: open user list modal for supporters paginated
  }, [])

  return supportersList.length ? (
    <div className={styles.container} onClick={handleClick}>
      <div className={styles.titleContainer}>
        <IconTrophy className={styles.trophyIcon} />
        <span className={styles.titleText}>{messages.topSupporters}</span>
        <span className={cn(styles.line, styles.topSupportersLine)} />
      </div>
      <div className={styles.topSupportersContainer}>
        <UserProfilePictureList
          users={supportersList.map(s => s.sender)}
          limit={MAX_TOP_SUPPORTERS}
        />
        <div className={styles.viewAll}>
          <span>{messages.viewAll}</span>
          <IconArrow className={styles.arrowIcon} />
        </div>
      </div>
    </div>
  ) : null
}
