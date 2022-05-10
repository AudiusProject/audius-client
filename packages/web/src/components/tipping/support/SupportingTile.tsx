import React, { useCallback } from 'react'

import { IconTrophy } from '@audius/stems'
import cn from 'classnames'
import { push as pushRoute } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { SquareSizes, WidthSizes } from 'common/models/ImageSizes'
import { Supporting } from 'common/models/Tipping'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserCoverPhoto } from 'hooks/useUserCoverPhoto'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { TIPPING_TOP_RANK_THRESHOLD } from 'utils/constants'

import styles from './Support.module.css'

const messages = {
  supporter: 'SUPPORTER'
}

type SupportingCardProps = {
  supporting: Supporting
}
export const SupportingTile = ({ supporting }: SupportingCardProps) => {
  const dispatch = useDispatch()
  const { receiver, rank } = supporting
  const handle = receiver.handle
  const isTopRank = rank >= 1 && rank <= TIPPING_TOP_RANK_THRESHOLD
  const profileImage = useUserProfilePicture(
    receiver.user_id,
    receiver._profile_picture_sizes,
    SquareSizes.SIZE_150_BY_150
  )
  const coverPhoto = useUserCoverPhoto(
    receiver.user_id,
    receiver._cover_photo_sizes,
    WidthSizes.SIZE_640
  )

  const handleClick = useCallback(() => {
    dispatch(pushRoute(`/${handle}`))
  }, [dispatch, handle])

  return (
    <div className={styles.tileContainer} onClick={handleClick}>
      <div className={styles.tileBackground}>
        <img className={styles.coverPhoto} src={coverPhoto} />
        <div className={styles.profilePictureContainer}>
          <img className={styles.profilePicture} src={profileImage} />
          <div className={styles.name}>
            {receiver.name}
            <UserBadges
              className={styles.badge}
              userId={receiver.user_id}
              badgeSize={12}
            />
          </div>
        </div>
      </div>
      {isTopRank ? (
        <div className={cn(styles.tileHeader, styles.topFive)}>
          <IconTrophy className={styles.trophyIcon} />
          <span>
            #{rank} {messages.supporter}
          </span>
        </div>
      ) : (
        <div className={styles.tileHeader}>
          <IconTip className={styles.tipIcon} />
          <span>{messages.supporter}</span>
        </div>
      )}
    </div>
  )
}
