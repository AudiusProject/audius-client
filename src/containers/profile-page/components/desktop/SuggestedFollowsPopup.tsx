import React, { RefObject, useState } from 'react'

import { Popup, PopupPosition } from '@audius/stems'
import cn from 'classnames'

import { ReactComponent as IconClose } from 'assets/img/iconRemove.svg'
import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import FollowButton from 'components/general/FollowButton'
import { useUserProfilePicture } from 'hooks/useImageSize'
import User from 'models/User'
import { ProfilePictureSizes, SquareSizes } from 'models/common/ImageSizes'
import zIndex from 'utils/zIndex'

import styles from './SuggestedFollowsPopup.module.css'

type SuggestedFollowsPopupProps = {
  anchorRef: RefObject<HTMLElement>
  artistName: string
  suggestedArtists: User[]
  isVisible: boolean
  onClose: () => void
  onArtistNameClicked: (handle: string) => void
  onFollowAll: () => void
  onUnfollowAll: () => void
}

const messages = {
  follow: 'Follow All',
  unfollow: 'Unfollow All',
  following: 'Following'
}

export const SuggestedFollowsPopup = ({
  anchorRef,
  artistName,
  suggestedArtists,
  isVisible,
  onClose,
  onArtistNameClicked,
  onFollowAll,
  onUnfollowAll
}: SuggestedFollowsPopupProps) => {
  if (!suggestedArtists || suggestedArtists.length === 0) {
    return null
  }
  return (
    <Popup
      position={PopupPosition.BOTTOM_LEFT}
      // Popup should allow for non-mutable refs
      // @ts-ignore
      anchorRef={anchorRef}
      isVisible={isVisible}
      zIndex={zIndex.FOLLOW_RECOMMENDATIONS_POPUP}
      onClose={onClose}
      className={styles.popup}
    >
      <div className={styles.popupContent}>
        <div className={styles.header}>
          <div
            role='button'
            title='Dismiss popup'
            className={styles.closeButton}
            onClick={onClose}
          >
            <IconClose className={cn(styles.icon, styles.remove)} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>Suggested Artists</h2>
          </div>
        </div>
        <p>Here are some accounts that vibe well with {artistName}:</p>
        <div className={styles.profilePictureList}>
          {suggestedArtists.map((a, i) => (
            <div key={i} className={styles.profilePictureWrapper}>
              <ArtistProfilePicture
                userId={a.user_id}
                profilePictureSizes={a._profile_picture_sizes}
              />
            </div>
          ))}
        </div>
        <p>
          Featuring{' '}
          {suggestedArtists
            .map<React.ReactNode>((a, i) => (
              <span
                key={i}
                className={styles.artistLink}
                role='link'
                onClick={() => onArtistNameClicked(a.handle)}
              >
                <ArtistPopover handle={a.handle}>{a.name}</ArtistPopover>
              </span>
            ))
            .reduce((prev, curr) => [prev, ',', curr])}
        </p>
        <div>
          <FollowButton
            invertedColor={true}
            messages={messages}
            size='full'
            onFollow={onFollowAll}
            onUnfollow={onUnfollowAll}
          />
        </div>
      </div>
    </Popup>
  )
}

const ArtistProfilePicture = ({
  userId,
  profilePictureSizes
}: {
  userId: number
  profilePictureSizes: ProfilePictureSizes | null
}) => {
  const profilePicture = useUserProfilePicture(
    userId,
    profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )
  return (
    <DynamicImage className={styles.profilePicture} image={profilePicture} />
  )
}
