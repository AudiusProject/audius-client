import React, { RefObject, useCallback } from 'react'

import { Popup, PopupPosition } from '@audius/stems'
import cn from 'classnames'

import { ReactComponent as IconClose } from 'assets/img/iconRemove.svg'
import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import FollowButton from 'components/general/FollowButton'
import { MountPlacement } from 'components/types'
import { useUserProfilePicture } from 'hooks/useImageSize'
import User from 'models/User'
import { ID } from 'models/common/Identifiers'
import { ProfilePictureSizes, SquareSizes } from 'models/common/ImageSizes'
import zIndex from 'utils/zIndex'

import styles from './SuggestedFollowsPopup.module.css'

type SuggestedFollowsPopupProps = {
  anchorRef: RefObject<HTMLElement>
  artistName: string
  suggestedArtists: Pick<
    User,
    | 'user_id'
    | 'handle'
    | 'name'
    | '_profile_picture_sizes'
    | 'does_current_user_follow'
  >[]
  isVisible: boolean
  onClose: () => void
  onArtistNameClicked: (handle: string) => void
  onFollowAll: (userIds: ID[]) => void
  onUnfollowAll: (userIds: ID[]) => void
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
  const onFollowAllClicked = useCallback(() => {
    onFollowAll(suggestedArtists.map(a => a.user_id))
  }, [suggestedArtists, onFollowAll])
  const onUnfollowAllClicked = useCallback(() => {
    onUnfollowAll(suggestedArtists.map(a => a.user_id))
  }, [suggestedArtists, onUnfollowAll])

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
          {suggestedArtists.map(a => (
            <div key={a.user_id} className={styles.profilePictureWrapper}>
              <ArtistProfilePictureWrapper
                userId={a.user_id}
                profilePictureSizes={a._profile_picture_sizes}
              />
            </div>
          ))}
        </div>
        <div>
          Featuring{' '}
          {suggestedArtists
            .map<React.ReactNode>((a, i) => (
              <ArtistPopoverWrapper
                key={a.user_id}
                handle={a.handle}
                name={a.name}
                onArtistNameClicked={onArtistNameClicked}
                closeParent={onClose}
              />
            ))
            .reduce((prev, curr) => [prev, ',', curr])}
        </div>
        <div>
          <FollowButton
            following={suggestedArtists.every(a => a.does_current_user_follow)}
            invertedColor={true}
            messages={messages}
            size='full'
            onFollow={onFollowAllClicked}
            onUnfollow={onUnfollowAllClicked}
          />
        </div>
      </div>
    </Popup>
  )
}

const ArtistProfilePictureWrapper = ({
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

const ArtistPopoverWrapper = ({
  handle,
  name,
  onArtistNameClicked,
  closeParent
}: {
  handle: string
  name: string
  onArtistNameClicked: (handle: string) => void
  closeParent: () => void
}) => {
  const onArtistNameClick = useCallback(() => {
    onArtistNameClicked(handle)
    closeParent()
  }, [onArtistNameClicked, handle, closeParent])
  return (
    <div className={styles.artistLink} role='link' onClick={onArtistNameClick}>
      <ArtistPopover mount={MountPlacement.PARENT} handle={handle}>
        {name}
      </ArtistPopover>
    </div>
  )
}
