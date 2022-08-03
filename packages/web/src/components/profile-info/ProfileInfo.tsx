import { SquareSizes, User, Nullable } from '@audius/common'
import cn from 'classnames'

import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './ProfileInfo.module.css'

type ProfileInfoProps = {
  user: Nullable<User>
  className?: string
  imgClassName?: string
  centered?: boolean
  badgeSize?: number
  displayNameClassName?: string
  handleClassName?: string
}
export const ProfileInfo = ({
  user,
  className = '',
  imgClassName = '',
  centered = true,
  badgeSize = 12,
  displayNameClassName,
  handleClassName
}: ProfileInfoProps) => {
  const image = useUserProfilePicture(
    user?.user_id ?? null,
    user?._profile_picture_sizes ?? null,
    SquareSizes.SIZE_150_BY_150
  )

  return user ? (
    <div className={cn(styles.receiver, className)}>
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
