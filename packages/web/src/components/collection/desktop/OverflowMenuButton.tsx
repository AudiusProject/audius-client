import { useCallback } from 'react'

import {
  Collection,
  collectionPageSelectors,
  CommonState,
  FollowSource,
  User,
  usersSocialActions
} from '@audius/common'
import { Button, ButtonType, IconKebabHorizontal } from '@audius/stems'
import { useDispatch, useSelector } from 'react-redux'

import Menu from 'components/menu/Menu'

import styles from './CollectionHeader.module.css'

const { getCollection, getUser } = collectionPageSelectors
const { followUser, unfollowUser } = usersSocialActions

const messages = {
  follow: 'Follow User',
  unfollow: 'Unfollow User'
}

type OverflowMenuButtonProps = {
  collectionId: number
  isOwner?: boolean
}

export const OverflowMenuButton = (props: OverflowMenuButtonProps) => {
  const { collectionId, isOwner } = props
  const dispatch = useDispatch()
  const {
    is_album,
    playlist_name,
    is_private,
    playlist_owner_id,
    has_current_user_saved
  } =
    (useSelector((state: CommonState) =>
      getCollection(state, { id: collectionId })
    ) as Collection) ?? {}

  const owner = useSelector(getUser) as User
  const isFollowing = owner?.does_current_user_follow

  const handleFollow = useCallback(() => {
    if (isFollowing) {
      dispatch(unfollowUser(playlist_owner_id, FollowSource.COLLECTION_PAGE))
    } else {
      dispatch(followUser(playlist_owner_id, FollowSource.COLLECTION_PAGE))
    }
  }, [isFollowing, dispatch, playlist_owner_id])

  const extraMenuItems = !isOwner
    ? [
        {
          text: isFollowing ? messages.unfollow : messages.follow,
          onClick: handleFollow
        }
      ]
    : []

  const overflowMenu = {
    type: is_album ? ('album' as const) : ('playlist' as const),
    playlistId: collectionId,
    playlistName: playlist_name,
    handle: owner?.handle,
    isFavorited: has_current_user_saved,
    mount: 'page',
    isOwner,
    includeEmbed: true,
    includeSave: false,
    includeVisitPage: false,
    isPublic: !is_private,
    extraMenuItems
  }

  return (
    <Menu menu={overflowMenu}>
      {(ref, triggerPopup) => (
        <Button
          ref={ref}
          leftIcon={<IconKebabHorizontal />}
          onClick={triggerPopup}
          text={null}
          textClassName={styles.buttonTextFormatting}
          type={ButtonType.COMMON}
        />
      )}
    </Menu>
  )
}
