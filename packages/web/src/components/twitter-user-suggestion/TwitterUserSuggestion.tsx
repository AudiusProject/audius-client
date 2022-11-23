import { useCallback, useContext, useEffect, useState } from 'react'

import {
  profilePageSelectors,
  MAX_PROFILE_SUPPORTING_TILES,
  userListActions
} from '@audius/common'
import { IconArrow } from '@audius/stems'
import { bool } from 'prop-types'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconWand } from 'assets/img/iconWand.svg'
import { useSelector } from 'common/hooks/useSelector'
import DiscoveryNodeSelection from 'components/discovery-node-selection/DiscoveryNodeSelection'
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
  const [didDo, setDidDo] = useState<boolean>(false)
  useEffect(() => {
    if (!profile || didDo) return
    // todo: fetch user handles from isaac's identity service
    const fetchAndSet = async () => {
      setDidDo(true)
      const url = `https://a5d0-75-140-15-163.ngrok.io/import_following?handle=${profile.handle}`
      const res = await fetch(url)
      const resUsers: { userId: number }[] = await res.json()
      const userIds = resUsers.map(({ userId }) => userId)
      // const users = await audiusBackendInstance.getCreators(userIds)
      // const usersNotFollowed = users.filter(
      //   (user) => !user.does_current_user_follow
      // )

      // const recommendedUserIds = usersNotFollowed.map((u) => u.user_id)
      dispatch({ type: 'FETCH_USERS_CUSTOM', userIds })
      // Set users
      setUserIds(userIds)
    }
    fetchAndSet()
  }, [profile, setUserIds, dispatch, didDo, setDidDo])

  const handleClick = useCallback(() => {
    if (profile) {
      dispatch(
        setUsers({
          userListType: UserListType.SUGGESTED_FOLLOWS,
          entityType: UserListEntityType.USER,
          id: profile.handle
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
