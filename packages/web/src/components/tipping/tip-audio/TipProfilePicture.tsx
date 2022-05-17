import React from 'react'

import cn from 'classnames'

import { SquareSizes } from 'common/models/ImageSizes'
import { User } from 'common/models/User'
import { Nullable } from 'common/utils/typeUtils'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './TipAudio.module.css'

export const TipProfilePicture = ({
  user,
  className = '',
  imgClassName = ''
}: {
  user: Nullable<User>
  className?: string
  imgClassName?: string
}) => {
  const image = useUserProfilePicture(
    user?.user_id ?? null,
    user?._profile_picture_sizes ?? null,
    SquareSizes.SIZE_150_BY_150
  )

  return user ? (
    <div className={cn(styles.profileUser, className)}>
      <div className={styles.accountWrapper}>
        <img className={cn(styles.dynamicPhoto, imgClassName)} src={image} />
        <div className={styles.userInfoWrapper}>
          <div className={styles.name}>
            {user.name}
            <UserBadges
              userId={user?.user_id}
              badgeSize={12}
              className={styles.badge}
            />
          </div>
          <div className={styles.handleContainer}>
            <span className={styles.handle}>{`@${user.handle}`}</span>
          </div>
        </div>
      </div>
    </div>
  ) : null
}
