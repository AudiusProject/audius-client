import React from 'react'
import { Button, ButtonType, IconArrow } from '@audius/stems'

import styles from './ArtistProfile.module.css'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { SquareSizes } from 'models/common/ImageSizes'
import { useUserProfilePicture } from 'hooks/useImageSize'
import UserBadges from 'containers/user-badges/UserBadges'

const ArtistProfile = props => {
  const profilePicture = useUserProfilePicture(
    props.userId,
    props.profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )
  return (
    <div className={styles.artistProfileContainer}>
      <div className={styles.artistLeftContainer}>
        <DynamicImage
          wrapperClassName={styles.artistProfilePictureWrapper}
          className={styles.artistProfilePicture}
          image={profilePicture}
        />
        <div className={styles.artistNameContainer}>
          <div className={styles.artistName}>
            <span>{props.name}</span>
            <UserBadges
              userId={props.userId}
              badgeSize={20}
              className={styles.iconVerified}
            />
          </div>
          <span className={styles.artistHandle}>{`@${props.handle}`}</span>
        </div>
      </div>
      <div>
        <Button
          text='View Profile'
          onClick={props.onViewProfile}
          type={ButtonType.COMMON}
          rightIcon={<IconArrow />}
          className={styles.artistProfileButton}
          textClassName={styles.artistProfileButtonText}
        />
      </div>
    </div>
  )
}

export default React.memo(ArtistProfile)
