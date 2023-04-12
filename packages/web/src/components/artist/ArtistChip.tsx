import { ComponentPropsWithoutRef } from 'react'

import { ID, SquareSizes, User } from '@audius/common'
import cn from 'classnames'

import { ArtistPopover } from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { MountPlacement } from 'components/types'
import UserBadges from 'components/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './ArtistChip.module.css'
import { ArtistChipFollowers } from './ArtistChipFollowers'
import { ArtistChipSupportFor } from './ArtistChipSupportFor'
import { ArtistChipSupportFrom } from './ArtistChipSupportFrom'

type ArtistIdentifierProps = {
  userId: ID
  name: string
  handle: string
  showPopover: boolean
  popoverMount?: MountPlacement
  onNavigateAway?: () => void
} & ComponentPropsWithoutRef<'div'>
const ArtistIdentifier = ({
  userId,
  name,
  handle,
  showPopover,
  popoverMount,
  onNavigateAway
}: ArtistIdentifierProps) => {
  return showPopover ? (
    <div>
      <ArtistPopover
        handle={handle}
        mouseEnterDelay={0.3}
        mount={popoverMount}
        onNavigateAway={onNavigateAway}
      >
        <div className={styles.name}>
          <span>{name}</span>
          <UserBadges
            userId={userId}
            className={cn(styles.badge)}
            badgeSize={14}
            inline
          />
        </div>
      </ArtistPopover>
      <ArtistPopover
        handle={handle}
        mouseEnterDelay={0.3}
        mount={popoverMount}
        onNavigateAway={onNavigateAway}
      >
        <div className={styles.handle}>@{handle}</div>
      </ArtistPopover>
    </div>
  ) : (
    <div>
      <div className={styles.name}>
        <span>{name}</span>
        <UserBadges
          userId={userId}
          className={cn(styles.badge)}
          badgeSize={14}
          inline
        />
      </div>
      <div className={styles.handle}>@{handle}</div>
    </div>
  )
}

type ArtistChipProps = {
  user: User
  onClickArtistName: () => void
  showPopover?: boolean
  showSupportFor?: ID
  showSupportFrom?: ID
  className?: string
  popoverMount?: MountPlacement
  customChips?: React.ReactNode
  onNavigateAway?: () => void
}
const ArtistChip = ({
  user,
  onClickArtistName,
  showPopover = true,
  showSupportFor,
  showSupportFrom,
  className = '',
  popoverMount = MountPlacement.PAGE,
  customChips = null,
  onNavigateAway
}: ArtistChipProps) => {
  const {
    user_id: userId,
    name,
    handle,
    _profile_picture_sizes: profilePictureSizes,
    follower_count: followers,
    does_follow_current_user: doesFollowCurrentUser
  } = user

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
      onClick={onClickArtistName}
    >
      {showPopover ? (
        <ArtistPopover
          handle={handle}
          mouseEnterDelay={0.3}
          mount={popoverMount}
          onNavigateAway={onNavigateAway}
        >
          <DynamicImage
            wrapperClassName={styles.profilePictureWrapper}
            skeletonClassName={styles.profilePictureSkeleton}
            className={styles.profilePicture}
            image={profilePicture}
          />
        </ArtistPopover>
      ) : (
        <DynamicImage
          wrapperClassName={styles.profilePictureWrapper}
          skeletonClassName={styles.profilePictureSkeleton}
          className={styles.profilePicture}
          image={profilePicture}
        />
      )}
      <div className={styles.text}>
        <div className={cn(styles.identity, 'name')}>
          <ArtistIdentifier
            userId={userId}
            name={name}
            handle={handle}
            showPopover={showPopover}
            popoverMount={popoverMount}
            onNavigateAway={onNavigateAway}
          />
        </div>
        {customChips || (
          <>
            <ArtistChipFollowers
              followerCount={followers}
              doesFollowCurrentUser={!!doesFollowCurrentUser}
            />
            {showSupportFor ? (
              <ArtistChipSupportFor
                artistId={user.user_id}
                userId={showSupportFor}
              />
            ) : null}
            {showSupportFrom ? (
              <ArtistChipSupportFrom
                artistId={user.user_id}
                userId={showSupportFrom}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default ArtistChip
