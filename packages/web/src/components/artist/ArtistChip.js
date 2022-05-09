import React, { useEffect, useState } from 'react'

import { IconTrophy, IconTrending } from '@audius/stems'
import cn from 'classnames'
import PropTypes from 'prop-types'

import { ReactComponent as IconTip } from 'assets/img/iconTip.svg'
import { ReactComponent as IconUser } from 'assets/img/iconUser.svg'
import { useSelector } from 'common/hooks/useSelector'
import { SquareSizes } from 'common/models/ImageSizes'
import { getProfileUser } from 'common/store/pages/profile/selectors'
import { getSupporting, getSupporters } from 'common/store/tipping/selectors'
import { formatCount } from 'common/utils/formatUtil'
import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import FollowsYouBadge from 'components/user-badges/FollowsYouBadge'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { USER_LIST_TAG as SUPPORTING_USER_LIST_TAG } from 'pages/supporting-page/sagas'
import { USER_LIST_TAG as TOP_SUPPORTERS_USER_LIST_TAG } from 'pages/top-supporters-page/sagas'

import styles from './ArtistChip.module.css'

const messages = {
  follower: 'Follower',
  followers: 'Followers',
  audio: '$AUDIO',
  supporter: 'Supporter'
}

const TIP_SUPPORT_TAGS = new Set([
  SUPPORTING_USER_LIST_TAG,
  TOP_SUPPORTERS_USER_LIST_TAG
])

const ArtistChip = props => {
  const profilePicture = useUserProfilePicture(
    props.userId,
    props.profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )
  const profile = useSelector(getProfileUser)
  const supportingMap = useSelector(getSupporting)
  const supportersMap = useSelector(getSupporters)
  const [tipAmount, setTipAmount] = useState(null)
  const [rank, setRank] = useState(null)

  useEffect(() => {
    if (profile) {
      if (props.tag === SUPPORTING_USER_LIST_TAG) {
        const profileSupporting = supportingMap[profile.user_id] ?? {}
        const supporting = profileSupporting[props.userId] ?? {}
        setTipAmount(supporting.amount ?? null)
      } else if (props.tag === TOP_SUPPORTERS_USER_LIST_TAG) {
        const profileSupporters = supportersMap[profile.user_id] ?? {}
        const supporter = profileSupporters[props.userId] ?? {}
        setRank(supporter.rank ?? null)
        setTipAmount(supporter.amount ?? null)
      }
    }
  }, [profile, supportingMap, supportersMap, props.tag, props.userId])

  return (
    <div
      className={cn(styles.artistChip, {
        [props.className]: !!props.className
      })}
    >
      {props.showPopover ? (
        <ArtistPopover handle={props.handle}>
          <DynamicImage
            wrapperClassName={styles.profilePictureWrapper}
            className={styles.profilePicture}
            image={profilePicture}
          />
        </ArtistPopover>
      ) : (
        <DynamicImage
          wrapperClassName={styles.profilePictureWrapper}
          className={styles.profilePicture}
          image={profilePicture}
        />
      )}
      <div className={styles.text}>
        <div
          className={cn(styles.identity, 'name')}
          onClick={props.onClickArtistName}
        >
          {props.showPopover ? (
            <ArtistPopover handle={props.handle}>
              <div className={styles.name}>
                <span>{props.name}</span>
                <UserBadges
                  userId={props.userId}
                  className={cn(styles.badge)}
                  badgeSize={10}
                  inline
                />
              </div>
              <div className={styles.handle}>@{props.handle}</div>
            </ArtistPopover>
          ) : (
            <div>
              <div className={styles.name}>
                <span>{props.name}</span>
                <UserBadges
                  userId={props.userId}
                  className={styles.badge}
                  badgeSize={10}
                  inline
                />
              </div>
              <div className={styles.handle}>@{props.handle}</div>
            </div>
          )}
        </div>
        <div className={styles.followersContainer}>
          <div className={cn(styles.followers, 'followers')}>
            <IconUser className={styles.icon} />
            <span className={styles.value}>{formatCount(props.followers)}</span>
            <span className={styles.label}>
              {props.followers === 1
                ? `${messages.follower}`
                : `${messages.followers}`}
            </span>
          </div>
          {props.doesFollowCurrentUser ? (
            <FollowsYouBadge className={styles.followsYou} />
          ) : null}
        </div>
        {TIP_SUPPORT_TAGS.has(props.tag) ? (
          <div className={styles.tipContainer}>
            {TOP_SUPPORTERS_USER_LIST_TAG === props.tag ? (
              <div className={styles.rank}>
                {rank > 0 && rank <= 5 ? (
                  <div className={styles.topSupporter}>
                    <IconTrophy className={styles.icon} />
                    <span className={styles.rankNumber}>#{rank}</span>
                    <span>{messages.supporter}</span>
                  </div>
                ) : (
                  <div className={styles.supporter}>
                    <IconTrending className={styles.icon} />
                    <span className={styles.rankNumber}>#{rank}</span>
                  </div>
                )}
              </div>
            ) : null}
            <div className={cn(styles.amount)}>
              <IconTip className={styles.icon} />
              <span className={styles.value}>{formatCount(tipAmount)}</span>
              <span className={styles.label}>{messages.audio}</span>
            </div>
          </div>
        ) : null}
      </div>
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
  showPopover: PropTypes.bool,
  doesFollowCurrentUser: PropTypes.bool,
  tag: PropTypes.string
}

ArtistChip.defaultProps = {
  name: '',
  followers: 0,
  showPopover: true
}

export default ArtistChip
