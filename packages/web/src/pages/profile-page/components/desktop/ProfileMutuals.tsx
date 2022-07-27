import { useCallback } from 'react'

import { removeNullable } from '@audius/common'
import { IconFollowing } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'

import { getUserId } from 'common/store/account/selectors'
import { getUsers } from 'common/store/cache/users/selectors'
import {
  getFolloweeFollows,
  getProfileUser,
  getProfileUserId
} from 'common/store/pages/profile/selectors'
import { ProfilePageNavSectionTitle } from 'components/profile-page-nav-section-title/ProfilePageNavSectionTitle'
import { ProfilePictureListTile } from 'components/profile-picture-list-tile/ProfilePictureListTile'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'

import styles from './ProfileMutuals.module.css'

const messages = {
  mutuals: 'Mutuals'
}

const MAX_MUTUALS = 5

const selectMutuals = createSelector(
  [getFolloweeFollows, getUsers],
  (followeeFollows, users) => {
    return followeeFollows.userIds
      .map(({ id }) => users[id])
      .filter(removeNullable)
  }
)

export const ProfileMutuals = () => {
  const userId = useSelector(getProfileUserId)
  const accountId = useSelector(getUserId)
  const profile = useSelector(getProfileUser)

  // @ts-ignore -- fixed in typescript v4
  const mutuals = useSelector(selectMutuals)
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    dispatch(
      setUsers({
        userListType: UserListType.MUTUAL_FOLLOWER,
        entityType: UserListEntityType.USER,
        id: userId
      })
    )
    dispatch(setVisibility(true))
  }, [dispatch, userId])

  if (!profile || userId === accountId || mutuals.length === 0) {
    return null
  }

  return (
    <div className={styles.mutualsContainer}>
      <ProfilePageNavSectionTitle
        title={messages.mutuals}
        titleIcon={<IconFollowing className={styles.followingIcon} />}
      />
      <ProfilePictureListTile
        onClick={handleClick}
        users={mutuals}
        totalUserCount={profile.current_user_followee_follow_count}
        limit={MAX_MUTUALS}
        disableProfileClick
      />
    </div>
  )
}
