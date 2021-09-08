import React, {
  forwardRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo
} from 'react'

import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as IconClose } from 'assets/img/iconRemove.svg'
import ArtistPopover from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import FollowButton from 'components/general/FollowButton'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import { MountPlacement } from 'components/types'
import UserBadges from 'containers/user-badges/UserBadges'
import { useUserProfilePicture } from 'hooks/useImageSize'
import User from 'models/User'
import { ID } from 'models/common/Identifiers'
import { ProfilePictureSizes, SquareSizes } from 'models/common/ImageSizes'
import { FollowSource } from 'services/analytics'
import * as socialActions from 'store/social/users/actions'
import { AppState } from 'store/types'
import { profilePage } from 'utils/route'

import styles from './ArtistRecommendations.module.css'
import { makeGetRelatedArtists } from './store/selectors'
import { fetchRelatedArtists } from './store/slice'

export type ArtistRecommendationsProps = {
  ref?: MutableRefObject<HTMLDivElement>
  itemClassName?: string
  className?: string
  header: React.ReactNode
  subheader?: React.ReactNode
  artistId: ID
  onClose: () => void
}

const messages = {
  follow: 'Follow All',
  unfollow: 'Unfollow All',
  following: 'Following'
}

export const ArtistRecommendations = forwardRef(
  (
    {
      className,
      itemClassName,
      artistId,
      header,
      subheader,
      onClose
    }: ArtistRecommendationsProps,
    ref: any
  ) => {
    const dispatch = useDispatch()

    // Start fetching the related artists
    useEffect(() => {
      dispatch(
        fetchRelatedArtists({
          userId: artistId
        })
      )
    }, [dispatch, artistId])

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

    let mainContent = <LoadingSpinner className={styles.spinner} />
    const isLoading = !suggestedArtists || suggestedArtists.length === 0

    if (!isLoading) {
      mainContent = (
        <>
          <div
            className={cn(
              styles.profilePictureList,
              styles.contentItem,
              itemClassName
            )}
          >
            {suggestedArtists.map(a => (
              <div key={a.user_id} className={styles.profilePictureWrapper}>
                <ArtistProfilePictureWrapper
                  userId={a.user_id}
                  handle={a.handle}
                  profilePictureSizes={a._profile_picture_sizes}
                />
              </div>
            ))}
          </div>
          <div className={cn(styles.contentItem, itemClassName)}>
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
        </>
      )
    }

    return (
      <div className={cn(styles.content, className)} ref={ref}>
        <div className={cn(styles.header, styles.contentItem, itemClassName)}>
          <div
            role='button'
            title='Dismiss'
            className={styles.closeButton}
            onClick={onClose}
          >
            <IconClose className={cn(styles.icon, styles.remove)} />
          </div>
          <div>{header}</div>
        </div>
        {subheader}
        {mainContent}
        <div className={cn(styles.contentItem, itemClassName)}>
          <FollowButton
            isDisabled={isLoading}
            following={suggestedArtists.every(a => a.does_current_user_follow)}
            invertedColor={true}
            messages={messages}
            size='full'
            onFollow={onFollowAllClicked}
            onUnfollow={onUnfollowAllClicked}
          />
        </div>
      </div>
    )
  }
)

const ArtistProfilePictureWrapper = ({
  userId,
  handle,
  profilePictureSizes
}: {
  userId: number
  handle: string
  profilePictureSizes: ProfilePictureSizes | null
}) => {
  const profilePicture = useUserProfilePicture(
    userId,
    profilePictureSizes,
    SquareSizes.SIZE_150_BY_150
  )
  return (
    <ArtistPopover mount={MountPlacement.PARENT} handle={handle}>
      <div>
        <DynamicImage
          className={styles.profilePicture}
          image={profilePicture}
        />
      </div>
    </ArtistPopover>
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
