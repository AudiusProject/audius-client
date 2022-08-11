import { MouseEventHandler, useCallback, useEffect, useState } from 'react'

import { SquareSizes, User } from '@audius/common'
import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import { toggleNotificationPanel } from 'common/store/notifications/actions'
import { getNotificationPanelIsOpen } from 'common/store/notifications/selectors'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { useUserProfilePicture } from 'hooks/useUserProfilePicture'

import styles from './ProfilePicture.module.css'

const imageLoadDelay = 250

type ProfilePictureProps = {
  user: User
  className?: string
  disablePopover?: boolean
  disableClick?: boolean
  stopPropagation?: boolean
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const { user, className, disablePopover, disableClick, stopPropagation } =
    props
  const { user_id, _profile_picture_sizes, handle } = user
  const [loadImage, setLoadImage] = useState(false)
  const dispatch = useDispatch()
  const profilePicture = useUserProfilePicture(
    user_id,
    _profile_picture_sizes,
    SquareSizes.SIZE_150_BY_150,
    undefined,
    undefined,
    loadImage
  )

  // Loading the images immediately causes lag in the NotificationPanel animation
  useEffect(() => {
    if (!loadImage) {
      const t = setTimeout(() => {
        setLoadImage(true)
      }, imageLoadDelay)
      return () => clearTimeout(t)
    }
  }, [loadImage])

  const handleClick: MouseEventHandler = useCallback(
    (e) => {
      if (stopPropagation) {
        e.stopPropagation()
      }
      if (!disableClick) {
        dispatch(push(`/${handle}`))
      }
    },
    [stopPropagation, disableClick, dispatch, handle]
  )

  const isNotificationPanelOpen = useSelector(getNotificationPanelIsOpen)
  const handleNavigateAway = useCallback(() => {
    if (isNotificationPanelOpen) {
      dispatch(toggleNotificationPanel())
    }
  }, [dispatch, isNotificationPanelOpen])

  const profilePictureElement = (
    <DynamicImage
      onClick={handleClick}
      wrapperClassName={cn(styles.profilePictureWrapper, className)}
      skeletonClassName={styles.profilePictureSkeleton}
      className={styles.profilePicture}
      image={profilePicture}
    />
  )

  if (disablePopover) return profilePictureElement

  return (
    <ArtistPopover
      handle={user.handle}
      component='span'
      onNavigateAway={handleNavigateAway}
    >
      {profilePictureElement}
    </ArtistPopover>
  )
}
