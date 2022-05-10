import React from 'react'

import cn from 'classnames'

import { ID } from 'common/models/Identifiers'
import { ProfilePictureSizes, SquareSizes } from 'common/models/ImageSizes'
import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './ArtistChip.module.css'
import { ArtistChipFollowers } from './ArtistChipFollowers'
import { ArtistChipTips } from './ArtistChipTips'

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

const ArtistIdentifier = ({
  userId,
  name,
  handle
}: {
  userId: ID
  name: string
  handle: string
}) => {
  return (
    <div>
      <div className={styles.name}>
        <span>{name}</span>
        <UserBadges
          userId={userId}
          className={cn(styles.badge)}
          badgeSize={10}
          inline
        />
      </div>
      <div className={styles.handle}>@{handle}</div>
    </div>
  )
}

const ArtistImage = ({ profilePicture }: { profilePicture: any }) => {
  return (
    <DynamicImage
      wrapperClassName={styles.profilePictureWrapper}
      className={styles.profilePicture}
      image={profilePicture}
    />
  )
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
          <ArtistImage profilePicture={profilePicture} />
        </ArtistPopover>
      ) : (
        <ArtistImage profilePicture={profilePicture} />
      )}
      <div className={styles.text}>
        <div
          className={cn(styles.identity, 'name')}
          onClick={onClickArtistName}
        >
          {showPopover ? (
            <ArtistPopover handle={handle}>
              <ArtistIdentifier userId={userId} name={name} handle={handle} />
            </ArtistPopover>
          ) : (
            <ArtistIdentifier userId={userId} name={name} handle={handle} />
          )}
        </div>
        <ArtistChipFollowers
          followerCount={followers}
          doesFollowCurrentUser={doesFollowCurrentUser}
        />
        {tag && <ArtistChipTips userId={userId} tag={tag} />}
      </div>
    </div>
  )
}

export default ArtistChip
