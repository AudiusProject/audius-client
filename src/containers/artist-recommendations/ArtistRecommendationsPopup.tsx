import React, { MutableRefObject, useCallback, useEffect, useMemo } from 'react'

import { Popup, PopupPosition } from '@audius/stems'
import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconClose } from 'assets/img/iconRemove.svg'
import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import FollowButton from 'components/general/FollowButton'
import { MountPlacement } from 'components/types'
import UserBadges from 'containers/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useImageSize'
import User from 'models/User'
import { ID } from 'models/common/Identifiers'
import { ProfilePictureSizes, SquareSizes } from 'models/common/ImageSizes'
import { FollowSource } from 'services/analytics'
import { getUser } from 'store/cache/users/selectors'
import * as socialActions from 'store/social/users/actions'
import { AppState } from 'store/types'
import { profilePage } from 'utils/route'
import zIndex from 'utils/zIndex'

import styles from './ArtistRecommendationsPopup.module.css'
import { makeGetRelatedArtists } from './store/selectors'
import { fetchRelatedArtists } from './store/slice'

type ArtistRecommendationsPopupProps = {
  anchorRef: MutableRefObject<HTMLElement>
  artistId: ID
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

export const ArtistRecommendationsPopup = ({
  anchorRef,
  artistId,
  isVisible,
  onClose
}: ArtistRecommendationsPopupProps) => {
  const dispatch = useDispatch()

  // Start fetching the related artists
  useEffect(() => {
    dispatch(
      fetchRelatedArtists({
        userId: artistId
      })
    )
  }, [dispatch, artistId])

  // Get the artist
  const user = useSelector<AppState, User | null>(state =>
    getUser(state, { id: artistId })
  )

  // Get the related artists
  const getRelatedArtists = useMemo(makeGetRelatedArtists, [artistId])
  const suggestedArtists = useSelector<AppState, User[]>(state =>
    getRelatedArtists(state, { id: artistId })
  )

  // Follow/Unfollow listeners
  const onFollowAllClicked = useCallback(() => {
    suggestedArtists.forEach(a => {
      dispatch(
        socialActions.followUser(
          a.user_id,
          FollowSource.ARTIST_RECOMMENDATIONS_POPUP
        )
      )
    })
  }, [dispatch, suggestedArtists])
  const onUnfollowAllClicked = useCallback(() => {
    suggestedArtists.forEach(a => {
      dispatch(
        socialActions.unfollowUser(
          a.user_id,
          FollowSource.ARTIST_RECOMMENDATIONS_POPUP
        )
      )
    })
  }, [dispatch, suggestedArtists])

  // Navigate to profile pages on artist links
  const onArtistNameClicked = useCallback(
    handle => {
      dispatch(push(profilePage(handle)))
    },
    [dispatch]
  )

  if (!user || !suggestedArtists || suggestedArtists.length === 0) {
    return null
  }
  const { name } = user
  return (
    <Popup
      position={PopupPosition.BOTTOM_LEFT}
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
        <p>Here are some accounts that vibe well with {name}</p>
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
            .slice(0, 3)
            .map<React.ReactNode>((a, i) => (
              <ArtistPopoverWrapper
                key={a.user_id}
                userId={a.user_id}
                handle={a.handle}
                name={a.name}
                onArtistNameClicked={onArtistNameClicked}
                closeParent={onClose}
              />
            ))
            .reduce((prev, curr) => [prev, ', ', curr])}
          {suggestedArtists.length > 3
            ? `, and ${suggestedArtists.length - 3} others.`
            : ''}
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
  userId,
  handle,
  name,
  onArtistNameClicked,
  closeParent
}: {
  userId: ID
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
        <UserBadges
          userId={userId}
          className={styles.verified}
          badgeSize={10}
          inline={true}
        />
      </ArtistPopover>
    </div>
  )
}
