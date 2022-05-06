import React from 'react'

import cn from 'classnames'
import PropTypes from 'prop-types'

import { ReactComponent as IconUser } from 'assets/img/iconUser.svg'
import { SquareSizes } from 'common/models/ImageSizes'
import { formatCount } from 'common/utils/formatUtil'
import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './ArtistChip.module.css'

const ArtistChip = props => {
  const profilePicture = useUserProfilePicture(
    props.userId,
    props.profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )

  return (
    <div
      className={cn(styles.artistChip, {
        [props.className]: !!props.className
      })}
    >
      <ArtistPopover handle={props.handle}>
        <DynamicImage
          wrapperClassName={styles.profilePictureWrapper}
          className={styles.profilePicture}
          image={profilePicture}
        />
        <div className={styles.text}>
          <div
            className={cn(styles.identity, 'name')}
            onClick={props.onClickArtistName}
          >
            {props.showPopover ? (
              <div className={styles.noPopover}>
                <div className={styles.name}>{props.name}</div>
                <div className={styles.handle}>@{props.handle}</div>
              </div>
            ) : (
              <div className={styles.noPopover}>
                <div className={styles.name}>{props.name}</div>
                <div className={styles.handle}>@{props.handle}</div>
              </div>
            )}
            <UserBadges
              userId={props.userId}
              className={styles.verified}
              badgeSize={10}
              inline
            />
          </div>
          <div className={cn(styles.followers, 'followers')}>
            <IconUser className={styles.userIcon} />
            <span className={styles.numFollowers}>
              {formatCount(props.followers)}
            </span>
            {props.followers === 1 ? ' Follower' : ' Followers'}
          </div>
        </div>
      </ArtistPopover>
    </div>
  )
}

ArtistChip.propTypes = {
  className: PropTypes.string,
  userId: PropTypes.number,
  profilePictureSizes: PropTypes.object,
  name: PropTypes.string,
  handle: PropTypes.string,
  followers: PropTypes.number,
  onClickArtistName: PropTypes.func,
  showPopover: PropTypes.bool
}

ArtistChip.defaultProps = {
  name: '',
  followers: 0,
  showPopover: true
}

export default ArtistChip
