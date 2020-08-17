import React from 'react'
import { UserListType } from 'store/application/ui/userListModal/types'
import { USER_LIST_TAG as REPOST_TAG } from 'containers/reposts-page/RepostsPage'
import { USER_LIST_TAG as FAVORITES_TAG } from 'containers/favorites-page/FavoritesPage'
import { USER_LIST_TAG as FOLLOWER_TAG } from 'containers/followers-page/FollowersPage'
import UserList from 'containers/user-list/UserList'
import { getUserList as repostsSelector } from 'containers/reposts-page/store/selectors'
import { getUserList as favoritesSelector } from 'containers/favorites-page/store/selectors'
import { getUserList as followersSelector } from 'containers/followers-page/store/selectors'

import SimpleBar from 'simplebar-react-legacy'

import styles from './UserListModal.module.css'
import Modal from 'components/general/Modal'
import { AppState } from 'store/types'
import { UserListStoreState } from 'containers/user-list/store/types'

const SIMPLE_BAR_ID = 'USER_LIST_SIMPLE_BAR'

type UserListModalProps = {
  userListType: UserListType
  isOpen: boolean
  onClose: () => void
}

const messages = {
  reposts: 'REPOSTS',
  favorites: 'FAVORITES',
  followers: 'FOLLOWERS'
}

const PAGE_SIZE = 15

const getScrollParent = () => {
  const simpleBarElement = window.document.getElementById(SIMPLE_BAR_ID)
  return simpleBarElement || null
}

const UserListModal = ({
  userListType,
  isOpen,
  onClose
}: UserListModalProps) => {
  let tag: string
  let selector: (state: AppState) => UserListStoreState
  let title: string
  switch (userListType) {
    case UserListType.FAVORITE:
      tag = FAVORITES_TAG
      selector = favoritesSelector
      title = messages.favorites
      break
    case UserListType.REPOST:
      tag = REPOST_TAG
      selector = repostsSelector
      title = messages.reposts
      break
    case UserListType.FOLLOWER:
      tag = FOLLOWER_TAG
      selector = followersSelector
      title = messages.followers
      break
    // Should not happen but typescript doesn't seem to be
    // smart enough to pass props to components below
    default:
      tag = FOLLOWER_TAG
      selector = followersSelector
      title = messages.followers
      break
  }

  return (
    <Modal title={title} width={360} visible={isOpen} onClose={onClose}>
      {/* Typescript complains about no valid constructor, possibly
        due to the two simplebar packages we maintain.
      // @ts-ignore */}
      <SimpleBar
        scrollableNodeProps={{ id: SIMPLE_BAR_ID }}
        className={styles.scrollable}
      >
        <UserList
          stateSelector={selector!}
          tag={tag}
          pageSize={PAGE_SIZE}
          getScrollParent={getScrollParent}
          beforeClickArtistName={onClose}
        />
      </SimpleBar>
    </Modal>
  )
}

export default UserListModal
