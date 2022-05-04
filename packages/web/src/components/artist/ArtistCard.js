import React, { Component } from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { ReactComponent as BadgeArtist } from 'assets/img/badgeArtist.svg'
import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { WidthSizes, SquareSizes } from 'common/models/ImageSizes'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import FollowButton from 'components/follow-button/FollowButton'
import { UserProfilePictureList } from 'components/notification/Notifications/UserProfilePictureList'
import Stats from 'components/stats/Stats'
import FollowsYouBadge from 'components/user-badges/FollowsYouBadge'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserCoverPhoto } from 'hooks/useUserCoverPhoto'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import {
  setUsers,
  setVisibility
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'

import styles from './ArtistCard.module.css'

const gradient = `linear-gradient(180deg, rgba(0, 0, 0, 0.001) 0%, rgba(0, 0, 0, 0.005) 67.71%, rgba(0, 0, 0, 0.15) 79.17%, rgba(0, 0, 0, 0.25) 100%)`

const messages = {
  supporting: 'Supporting'
}

const MAX_TOP_SUPPORTING = 7

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

  const darkenedCoverPhoto = `${gradient}, url(${coverPhoto})`

  return (
    <DynamicImage
      wrapperClassName={styles.artistCoverPhoto}
      image={darkenedCoverPhoto}
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
            <UserBadges
              userId={props.userId}
              badgeSize={14}
              className={styles.iconVerified}
              useSVGTiers
            />
          </div>
          <div className={styles.artistHandleWrapper}>
            <div
              className={styles.artistHandle}
              onClick={props.onNameClick}
            >{`@${props.handle}`}</div>
            {props.doesFollowCurrentUser ? <FollowsYouBadge /> : null}
          </div>
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

  handleSupportingClick = () => {
    this.props.setUsers(this.props.userId)
    this.props.openModal()
  }

  render() {
    const {
      description,
      following,
      onFollow,
      onUnfollow,
      supportingList,
      ...artistProps
    } = this.props

    return (
      <div className={styles.popoverContainer} onClick={this.handleClick}>
        <div className={styles.artistCardContainer}>
          <ArtistCover {...artistProps} />
          <div className={styles.artistStatsContainer}>
            <Stats clickable={false} stats={this.getStats()} size='medium' />
          </div>
          <div className={styles.contentContainer}>
            <div>
              {supportingList.length > 0 && (
                <div
                  className={styles.supportingContainer}
                  onClick={this.handleSupportingClick}
                >
                  <div className={styles.supportingTitleContainer}>
                    <IconTip className={styles.supportingIcon} />
                    <span className={styles.supportingTitle}>
                      {messages.supporting}
                    </span>
                  </div>
                  <div className={styles.line} />
                  <UserProfilePictureList
                    limit={MAX_TOP_SUPPORTING}
                    users={supportingList.map(s => s.receiver)}
                    disableProfileClick
                  />
                </div>
              )}
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
  supportingList: PropTypes.array,

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
  onNameClick: () => {},
  following: false,
  onFollow: () => {},
  onUnfollow: () => {},
  supportingList: []
}

const mapDispatchToProps = dispatch => ({
  setUsers: id =>
    dispatch(
      setUsers({
        userListType: UserListType.SUPPORTING,
        entityType: UserListEntityType.USER,
        id
      })
    ),
  openModal: () => dispatch(setVisibility(true))
})

export default connect(null, mapDispatchToProps)(ArtistCard)
