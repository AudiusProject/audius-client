import React, { useCallback } from 'react'

import { IconTrophy, IconArrow } from '@audius/stems'
import cn from 'classnames'
import { useDispatch } from 'react-redux'

import { useSelector } from 'common/hooks/useSelector'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSupporters } from 'common/store/tipping/selectors'
import { UserProfilePictureList } from 'components/notification/Notifications/UserProfilePictureList'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'
import { encodeHashId } from 'utils/route/hashIds'

import styles from './Support.module.css'

const MAX_TOP_SUPPORTERS = 5

const messages = {
  topSupporters: 'Top Supporters',
  viewAll: 'View All'
}

export const TopSupporters = () => {
  const dispatch = useDispatch()
  const profile = useSelector(getProfileUser)
  const encodedProfileUserId = encodeHashId(profile?.user_id ?? null)
  const supportersMap = useSelector(getSupporters)
  const supportersForProfile = encodedProfileUserId
    ? supportersMap[encodedProfileUserId] ?? {}
    : {}
  const rankedSupportersList = Object.keys(supportersForProfile)
    .sort((k1, k2) => {
      return supportersForProfile[k1].rank - supportersForProfile[k2].rank
    })
    .map(k => supportersForProfile[k])

  const handleClick = useCallback(() => {
    if (profile) {
      dispatch(
        setUsers({
          userListType: UserListType.SUPPORTER,
          entityType: UserListEntityType.USER,
          id: profile.user_id
        })
      )
      dispatch(setVisibility(true))
    }
  }, [profile, dispatch])

  return profile && rankedSupportersList.length > 0 ? (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <IconTrophy className={styles.trophyIcon} />
        <span className={styles.titleText}>{messages.topSupporters}</span>
        <span className={cn(styles.line, styles.topSupportersLine)} />
      </div>
      <div className={styles.topSupportersContainer} onClick={handleClick}>
        <UserProfilePictureList
          users={rankedSupportersList.map(s => s.sender)}
          totalUserCount={profile.supporter_count}
          limit={MAX_TOP_SUPPORTERS}
          stopPropagation
        />
        <div className={styles.viewAll}>
          <span>{messages.viewAll}</span>
          <IconArrow className={styles.arrowIcon} />
        </div>
      </div>
    </div>
  ) : null
}
