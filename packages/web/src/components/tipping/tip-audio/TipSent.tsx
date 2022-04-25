import React, { useCallback } from 'react'

import { Button, ButtonType, IconTwitterBird, IconCheck } from '@audius/stems'
import cn from 'classnames'

import { useSelector } from 'common/hooks/useSelector'
import { SquareSizes } from 'common/models/ImageSizes'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSendAmount } from 'common/store/tipping/selectors'
import { formatWei } from 'common/utils/wallet'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './TipAudio.module.css'

const messages = {
  sending: 'SENDING',
  sentSuccessfully: 'SENT SUCCESSFULLY',
  supportOnTwitter: 'Share your support on Twitter!',
  shareToTwitter: 'Share to Twitter'
}

export const TipSent = () => {
  const sendAmount = useSelector(getSendAmount)
  const profile = useSelector(getProfileUser)
  const profileImage = useUserProfilePicture(
    profile?.user_id ?? null,
    profile?._profile_picture_sizes ?? null,
    SquareSizes.SIZE_150_BY_150
  )

  const handleShareClick = useCallback(() => {
    // todo: share to twitter
  }, [])

  return profile ? (
    <div className={styles.container}>
      <div className={cn(styles.flexCenter, styles.sentSuccessfullyContainer)}>
        <span className={styles.sentSuccessfullyIcon}>
          <IconCheck />
        </span>
        {messages.sentSuccessfully}
      </div>
      <div className={cn(styles.flexCenter, styles.sentAudio)}>
        <span className={styles.sendAmount}>{formatWei(sendAmount, true)}</span>
        $AUDIO
      </div>
      <div className={cn(styles.profileUser, styles.confirmProfileUser)}>
        <div className={styles.accountWrapper}>
          <img
            className={cn(styles.dynamicPhoto, styles.smallDynamicPhoto)}
            src={profileImage}
          />
          <div className={styles.userInfoWrapper}>
            <div className={styles.name}>
              {profile.name}
              <UserBadges
                userId={profile?.user_id}
                badgeSize={12}
                className={styles.badge}
              />
            </div>
            <div className={styles.handleContainer}>
              <span className={styles.handle}>{`@${profile.handle}`}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={cn(styles.flexCenter, styles.support)}>
        {messages.supportOnTwitter}
      </div>
      <div className={styles.flexCenter}>
        <Button
          className={styles.shareButton}
          type={ButtonType.PRIMARY}
          text={messages.shareToTwitter}
          onClick={handleShareClick}
          leftIcon={<IconTwitterBird width={24} height={24} />}
        />
      </div>
    </div>
  ) : null
}
