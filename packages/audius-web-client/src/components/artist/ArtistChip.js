import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { formatCount } from 'utils/formatUtil'

import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { SquareSizes } from 'models/common/ImageSizes'
import { useUserProfilePicture } from 'hooks/useImageSize'

import placeholderProfilePicture from 'assets/img/imageProfilePicEmpty2X.png'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
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
      <DynamicImage
        wrapperClassName={styles.profilePictureWrapper}
        className={styles.profilePicture}
        image={profilePicture}
      />
      <div className={styles.text}>
        <div
          className={cn(styles.name, 'name')}
          onClick={props.onClickArtistName}
        >
          {props.showPopover ? (
            <ArtistPopover handle={props.handle}>{props.name}</ArtistPopover>
          ) : (
            props.name
          )}
          {props.verified ? <IconVerified className={styles.verified} /> : null}
        </div>
        <div className={cn(styles.followers, 'followers')}>
          {formatCount(props.followers)}{' '}
          {props.followers === 1 ? 'Follower' : 'Followers'}
        </div>
      </div>
    </div>
  )
}

ArtistChip.propTypes = {
  className: PropTypes.string,
  userId: PropTypes.number,
  profilePictureSizes: PropTypes.object,
  profileImgUrl: PropTypes.string,
  name: PropTypes.string,
  handle: PropTypes.string,
  followers: PropTypes.number,
  verified: PropTypes.bool,
  onClickArtistName: PropTypes.func,
  showPopover: PropTypes.bool
}

ArtistChip.defaultProps = {
  profileImgUrl: placeholderProfilePicture,
  name: '',
  followers: 0,
  verified: false,
  showPopover: true
}

export default ArtistChip
