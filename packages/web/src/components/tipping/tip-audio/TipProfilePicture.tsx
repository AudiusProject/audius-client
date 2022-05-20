import React from 'react'

import cn from 'classnames'

import { SquareSizes } from 'common/models/ImageSizes'
import { User } from 'common/models/User'
import { Nullable } from 'common/utils/typeUtils'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './TipAudio.module.css'

type TipProfilePictureProps = {
  user: Nullable<User>
  className?: string
  imgClassName?: string
  centered?: boolean
  badgeSize?: number
  displayNameClassName?: string
  handleClassName?: string
}
export const TipProfilePicture = ({
  user,
  className = '',
  imgClassName = '',
  centered = true,
  badgeSize = 12,
  displayNameClassName,
  handleClassName
}: TipProfilePictureProps) => {
  const image = useUserProfilePicture(
    user?.user_id ?? null,
    user?._profile_picture_sizes ?? null,
    SquareSizes.SIZE_150_BY_150
  )

  return user ? (
    <div className={cn(styles.profileUser, className)}>
      <div
        className={cn(styles.accountWrapper, {
          [styles.accountWrapperLeftAlign]: !centered
        })}
      >
        <img className={cn(styles.dynamicPhoto, imgClassName)} src={image} />
        <div className={styles.userInfoWrapper}>
          <div className={cn(styles.name, displayNameClassName)}>
            {user.name}
            <UserBadges
              userId={user?.user_id}
              badgeSize={badgeSize}
              className={styles.badge}
            />
          </div>
          <div className={styles.handleContainer}>
            <span
              className={cn(styles.handle, handleClassName)}
            >{`@${user.handle}`}</span>
          </div>
        </div>
      </div>
    </div>
  ) : null
}
