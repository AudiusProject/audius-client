import cn from 'classnames'

import { ReactComponent as IconUser } from 'assets/img/iconUser.svg'
import { formatCount } from 'common/utils/formatUtil'
import FollowsYouBadge from 'components/user-badges/FollowsYouBadge'

import styles from './ArtistChip.module.css'

const messages = {
  follower: 'Follower',
  followers: 'Followers'
}

type ArtistChipFollowersProps = {
  followerCount: number
  doesFollowCurrentUser: boolean
}
export const ArtistChipFollowers = ({
  followerCount,
  doesFollowCurrentUser
}: ArtistChipFollowersProps) => {
  return (
    <div className={styles.followersContainer}>
      <div className={cn(styles.followers, 'followers')}>
        <IconUser className={styles.icon} />
        <span className={styles.value}>{formatCount(followerCount)}</span>
        <span className={styles.label}>
          {followerCount === 1
            ? `${messages.follower}`
            : `${messages.followers}`}
        </span>
      </div>
      {doesFollowCurrentUser ? (
        <FollowsYouBadge className={styles.followsYou} />
      ) : null}
    </div>
  )
}
