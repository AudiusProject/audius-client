import { useCallback, useContext, useEffect, useState } from 'react'

import {
  profilePageSelectors,
  MAX_PROFILE_SUPPORTING_TILES,
  userListActions
} from '@audius/common'
import { IconArrow } from '@audius/stems'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconWand } from 'assets/img/iconWand.svg'
import { useSelector } from 'common/hooks/useSelector'
import { ProfilePageNavSectionTitle } from 'components/profile-page-nav-section-title/ProfilePageNavSectionTitle'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'

import { TwitterFollow } from './TwitterFollow'
import styles from './TwitterUserSuggestion.module.css'
const { getProfileUser } = profilePageSelectors

const messages = {
  followSuggestions: 'Recommended Follows',
  seeMorePrefix: 'See ',
  seeMoreSuffix: ' More'
}

export const TwitterSuggestions = () => {
  const dispatch = useDispatch()
  const profile = useSelector(getProfileUser)

  const [userIds, setUserIds] = useState<number[]>([])
  useEffect(() => {
    // todo: fetch user handles from isaac's identity service
    const fetchAndSet = async () => {
      // const domain = ''
      // const res = await fetch(`${domain}/import_following`)
      // const users: { userId: number }[] = await res.json()
      // const userIds = users.map(({ userId }) => userId)
      const userIds = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
      ]
      const users = await audiusBackendInstance.getCreators(userIds)
      const usersNotFollowed = users.filter(
        (user) => !user.does_current_user_follow
      )
      console.log({ users })
      const recommendedUserIds = usersNotFollowed.map((u) => u.user_id)
      console.log({ recommendedUserIds })
      dispatch({ type: 'FETCH_USERS_CUSTOM', userIds: recommendedUserIds })
      // Set users
      setUserIds(recommendedUserIds)
    }
    fetchAndSet()
  }, [setUserIds, dispatch])

  const handleClick = useCallback(() => {
    if (profile) {
      dispatch(
        setUsers({
          userListType: UserListType.SUGGESTED_FOLLOWS,
          entityType: UserListEntityType.USER,
          id: profile.user_id
        })
      )
      dispatch(
        userListActions.setUserIds(
          UserListType.SUGGESTED_FOLLOWS,
          userIds,
          false
        )
      )
      dispatch(setVisibility(true))
    }
  }, [profile, dispatch])

  return profile && userIds.length > 0 ? (
    <div className={styles.container}>
      <ProfilePageNavSectionTitle
        title={messages.followSuggestions}
        titleIcon={<IconWand className={styles.tipIcon} />}
      />
      {userIds.slice(0, MAX_PROFILE_SUPPORTING_TILES).map((userId, index) => (
        <div key={`supporting-${index}`} className={styles.tile}>
          <TwitterFollow userId={userId} />
        </div>
      ))}
      {userIds.length > MAX_PROFILE_SUPPORTING_TILES && (
        <div className={styles.seeMore} onClick={handleClick}>
          <span>
            {messages.seeMorePrefix}+
            {`${userIds.length - MAX_PROFILE_SUPPORTING_TILES}`}
            {messages.seeMoreSuffix}
          </span>
          <IconArrow className={styles.arrowIcon} />
        </div>
      )}
    </div>
  ) : null
}
