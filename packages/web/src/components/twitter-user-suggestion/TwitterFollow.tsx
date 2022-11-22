import { useCallback, useEffect } from 'react'

import {
  SquareSizes,
  WidthSizes,
  User,
  Nullable,
  cacheUsersSelectors,
  imageCoverPhotoBlank,
  imageProfilePicEmpty as profilePicEmpty,
  FollowSource,
  usersSocialActions
} from '@audius/common'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import FollowButton from 'components/follow-button/FollowButton'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserCoverPhoto } from 'hooks/useUserCoverPhoto'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { AppState } from 'store/types'

import styles from './TwitterFollow.module.css'

const { followUser, unfollowUser } = usersSocialActions
const { getUser } = cacheUsersSelectors

type TwitterFollowProps = {
  userId: number
}

export const TwitterFollow = ({ userId }: TwitterFollowProps) => {
  const user = useSelector<AppState, Nullable<User>>((state) =>
    getUser(state, { id: userId })
  )

  useEffect(() => {
    if (userId && !user) {
      // Code to disptch fetch userID
    }
  }, [userId, user])

  const dispatch = useDispatch()

  const profileImage =
    useUserProfilePicture(
      user?.user_id ?? null,
      user?._profile_picture_sizes ?? null,
      SquareSizes.SIZE_150_BY_150
    ) || profilePicEmpty
  const coverPhoto =
    useUserCoverPhoto(
      user?.user_id ?? null,
      user?._cover_photo_sizes ?? null,
      WidthSizes.SIZE_640
    ) || imageCoverPhotoBlank

  const handleClick = () => {
    dispatch(pushRoute(`/${user?.handle}`))
  }

  const handleFollow = useCallback(() => {
    dispatch(followUser(userId, FollowSource.HOVER_TILE))
  }, [dispatch, userId])

  const handleUnfollow = useCallback(() => {
    dispatch(unfollowUser(userId, FollowSource.HOVER_TILE))
  }, [dispatch, userId])

  if (!user) {
    return null
  }

  return (
    <div
      className={cn(styles.tileContainer, styles.tileBackground)}
      style={{
        backgroundImage: `url(${coverPhoto}), linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.1) 50%,
          rgba(0, 0, 0, 0.3) 100%
        )`
      }}
      onClick={handleClick}
    >
      <div className={styles.profilePictureContainer}>
        <img className={styles.profilePicture} src={profileImage} />
        <FollowButton
          className={styles.followButton}
          following={user.does_current_user_follow}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          stopPropagation
        />
        <span className={styles.name}>{user.name}</span>
        <UserBadges
          className={styles.badge}
          userId={user.user_id}
          badgeSize={12}
        />
      </div>
    </div>
  )
}
