import React, { useCallback } from 'react'

import { IconTrophy } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import { ID } from 'common/models/Identifiers'
import { User } from 'common/models/User'
import { getUsers } from 'common/store/cache/users/selectors'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getOptimisticSupporters } from 'common/store/tipping/selectors'
import { ProfilePictureListTile } from 'components/profile-picture-list-tile/ProfilePictureListTile'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'
import { AppState } from 'store/types'
import { MAX_PROFILE_TOP_SUPPORTERS } from 'utils/constants'

import styles from './Support.module.css'

const messages = {
  topSupporters: 'Top Supporters'
}

export const TopSupporters = () => {
  const dispatch = useDispatch()
  const profile = useSelector(getProfileUser)
  const supportersMap = useSelector(getOptimisticSupporters)
  const supportersForProfile = profile?.user_id
    ? supportersMap[profile.user_id] ?? {}
    : {}
  const rankedSupporters = useSelector<AppState, User[]>(state => {
    const usersMap = getUsers(state, {
      ids: (Object.keys(supportersForProfile) as unknown) as ID[]
    })
    return Object.keys(supportersForProfile)
      .sort((k1, k2) => {
        return (
          supportersForProfile[(k1 as unknown) as ID].rank -
          supportersForProfile[(k2 as unknown) as ID].rank
        )
      })
      .map(k => usersMap[(k as unknown) as ID])
      .filter(Boolean)
  })

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

  if (!profile || rankedSupporters.length === 0) {
    return null
  }

  return (
    <ProfilePictureListTile
      onClick={handleClick}
      title={messages.topSupporters}
      titleIcon={<IconTrophy className={styles.trophyIcon} />}
      className={styles.container}
      users={rankedSupporters}
      totalUserCount={profile.supporter_count}
      limit={MAX_PROFILE_TOP_SUPPORTERS}
      stopPropagation
    />
  )
}
