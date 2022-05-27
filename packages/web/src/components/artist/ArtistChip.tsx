import React, { ComponentPropsWithoutRef } from 'react'

import cn from 'classnames'

import { ID } from 'common/models/Identifiers'
import { ProfilePictureSizes, SquareSizes } from 'common/models/ImageSizes'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'
import { USER_LIST_TAG as SUPPORTING_USER_LIST_TAG } from 'pages/supporting-page/sagas'
import { USER_LIST_TAG as TOP_SUPPORTERS_USER_LIST_TAG } from 'pages/top-supporters-page/sagas'

import styles from './ArtistChip.module.css'
import { ArtistChipFollowers } from './ArtistChipFollowers'
import { ArtistChipTips } from './ArtistChipTips'

const TIP_SUPPORT_TAGS = new Set([
  SUPPORTING_USER_LIST_TAG,
  TOP_SUPPORTERS_USER_LIST_TAG
])

type ArtistIdentifierProps = {
  userId: ID
  name: string
  handle: string
  showPopover: boolean
} & ComponentPropsWithoutRef<'div'>
const ArtistIdentifier = ({
  userId,
  name,
  handle,
  showPopover,
  ...other
}: ArtistIdentifierProps) => {
  return (
    <div>
      {showPopover ? (
        <ArtistPopover handle={handle}>
          <div className={styles.name}>
            <span>{name}</span>
            <UserBadges
              userId={userId}
              className={cn(styles.badge)}
              badgeSize={10}
              inline
            />
          </div>
        </ArtistPopover>
      ) : (
        <div className={styles.name}>
          <span>{name}</span>
          <UserBadges
            userId={userId}
            className={cn(styles.badge)}
            badgeSize={10}
            inline
          />
        </div>
      )}
      {showPopover ? (
        <ArtistPopover handle={handle}>
          <div className={styles.handle}>@{handle}</div>
        </ArtistPopover>
      ) : (
        <div className={styles.handle}>@{handle}</div>
      )}
    </div>
  )
}

type ArtistChipProps = {
  userId: number
  name: string
  handle: string
  profilePictureSizes: ProfilePictureSizes
  followers: number
  onClickArtistName: () => void
  showPopover?: boolean
  doesFollowCurrentUser?: boolean
  tag?: string
  className?: string
}
const ArtistChip = ({
  userId,
  name,
  handle,
  profilePictureSizes,
  followers,
  onClickArtistName,
  showPopover = true,
  doesFollowCurrentUser = false,
  tag,
  className = ''
}: ArtistChipProps) => {
  const profilePicture = useUserProfilePicture(
    userId,
    profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )

  return (
    <div
      className={cn(styles.artistChip, {
        [className]: !!className
      })}
    >
      {showPopover ? (
        <ArtistPopover handle={handle}>
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
          onClick={onClickArtistName}
        >
          <ArtistIdentifier
            userId={userId}
            name={name}
            handle={handle}
            showPopover
          />
        </div>
        <ArtistChipFollowers
          followerCount={followers}
          doesFollowCurrentUser={doesFollowCurrentUser}
        />
        {tag && TIP_SUPPORT_TAGS.has(tag) ? (
          <ArtistChipTips userId={userId} tag={tag} />
        ) : null}
      </div>
    </div>
  )
}

export default ArtistChip
