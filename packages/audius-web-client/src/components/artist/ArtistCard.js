import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ArtistCard.module.css'
import { ReactComponent as BadgeArtist } from 'assets/img/badgeArtist.svg'
import { ReactComponent as IconVerified } from 'assets/img/iconVerified.svg'
import FollowButton from 'components/general/FollowButton'
import Stats from 'components/general/Stats'

import { useUserCoverPhoto, useUserProfilePicture } from 'hooks/useImageSize'
import { WidthSizes, SquareSizes } from 'models/common/ImageSizes'
import DynamicImage from 'components/dynamic-image/DynamicImage'

const ArtistCover = props => {
  const coverPhoto = useUserCoverPhoto(
    props.userId,
    props.coverPhotoSizes,
    WidthSizes.SIZE_640
  )
  const profilePicture = useUserProfilePicture(
    props.userId,
    props.profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )
  return (
    <DynamicImage
      wrapperClassName={styles.artistCoverPhoto}
      image={coverPhoto}
      immediate
    >
      <div className={styles.coverPhotoContentContainer}>
        {props.isArtist ? <BadgeArtist className={styles.badgeArtist} /> : null}
        <DynamicImage
          wrapperClassName={styles.profilePictureWrapper}
          className={styles.profilePicture}
          image={profilePicture}
          immediate
        />
        <div className={styles.headerTextContainer}>
          <div className={styles.nameContainer}>
            <div className={styles.artistName} onClick={props.onNameClick}>
              {props.name}
            </div>
            {props.isVerified ? (
              <IconVerified className={styles.iconVerified} />
            ) : null}
          </div>
          <div
            className={styles.artistHandle}
            onClick={props.onNameClick}
          >{`@${props.handle}`}</div>
        </div>
      </div>
    </DynamicImage>
  )
}

class ArtistCard extends Component {
  handleClick = e => {
    // NOTE: Prevents parent div's onClick
    e.stopPropagation()
  }

  getStats = () => {
    const {
      isArtist,
      trackCount,
      playlistCount,
      followerCount,
      followingCount
    } = this.props

    return isArtist
      ? [
          {
            number: trackCount,
            title: trackCount === 1 ? 'track' : 'tracks',
            key: 'track'
          },
          {
            number: followerCount,
            title: followerCount === 1 ? 'follower' : 'followers',
            key: 'follower'
          },
          { number: followingCount, title: 'following', key: 'following' }
        ]
      : [
          {
            number: playlistCount,
            title: playlistCount === 1 ? 'playlist' : 'playlists',
            key: 'playlist'
          },
          {
            number: followerCount,
            title: followerCount === 1 ? 'follower' : 'followers',
            key: 'follower'
          },
          { number: followingCount, title: 'following', key: 'following' }
        ]
  }

  render() {
    const {
      description,
      following,
      onFollow,
      onUnfollow,
      ...artistProps
    } = this.props

    return (
      <div className={styles.popoverContainer} onClick={this.handleClick}>
        <div className={styles.artistCardContainer}>
          <ArtistCover {...artistProps} />
          <div className={styles.artistStatsContainer}>
            <Stats clickable={false} stats={this.getStats()} />
          </div>
          <div className={styles.descriptionContainer}>
            <div>
              <div className={styles.description}>{description}</div>
              <FollowButton
                className={styles.followButton}
                following={following}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ArtistCard.propTypes = {
  description: PropTypes.string,
  trackCount: PropTypes.number,
  playlistCount: PropTypes.number,
  followerCount: PropTypes.number,
  followingCount: PropTypes.number,
  name: PropTypes.string,
  handle: PropTypes.string,
  userId: PropTypes.number,
  profilePictureSizes: PropTypes.object,
  coverPhotoSizes: PropTypes.object,
  isArtist: PropTypes.bool,
  isVerified: PropTypes.bool,

  onNameClick: PropTypes.func,
  following: PropTypes.bool,
  onFollow: PropTypes.func,
  onUnfollow: PropTypes.func
}

ArtistCard.defaultProps = {
  isArtist: false,
  description: '',
  trackCount: 0,
  playlistCount: 0,
  followerCount: 0,
  followingCount: 0,
  name: '',
  handle: '',
  isVerified: true,
  onNameClick: () => {},
  following: false,
  onFollow: () => {},
  onUnfollow: () => {}
}

export default ArtistCard
