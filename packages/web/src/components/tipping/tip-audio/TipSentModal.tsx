import React, { useCallback } from 'react'

import { Button, ButtonType, IconTwitterBird } from '@audius/stems'
import cn from 'classnames'

import { useSelector } from 'common/hooks/useSelector'
import { SquareSizes } from 'common/models/ImageSizes'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSendAmount } from 'common/store/tipping/selectors'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './TipAudio.module.css'

const messages = {
  sending: 'SENDING',
  sentSuccessfully: 'SENT SUCCESSFULLY',
  supportOnTwitter: 'Share your support on Twitter!',
  shareToTwitter: 'Share to Twitter'
}

export const TipSentModal = () => {
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
      <div className={cn(styles.rowCenter, styles.sentAudio)}>
        <span className={styles.sentAudioAmount}>{sendAmount}</span>
        $AUDIO
      </div>
      <div className={cn(styles.rowCenter, styles.sentSuccessfully)}>
        {messages.sentSuccessfully}
      </div>
      <div className={styles.profileUser}>
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
          </div>
        </div>
      </div>
      <div className={cn(styles.rowCenter, styles.support)}>
        {messages.supportOnTwitter}
      </div>
      <div className={styles.rowCenter}>
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
