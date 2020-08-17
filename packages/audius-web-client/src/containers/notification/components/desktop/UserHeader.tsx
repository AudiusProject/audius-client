import React, { memo, useCallback, MouseEvent, useEffect } from 'react'
import { connect } from 'react-redux'
import { AppState, Status } from 'store/types'
import { Dispatch } from 'redux'
import { push as pushRoute } from 'connected-react-router'
import cn from 'classnames'
import Tooltip from 'components/tooltip/Tooltip'
import { formatCount } from 'utils/formatUtil'

import User from 'models/User'
import ArtistPopover from 'components/artist/ArtistPopover'
import UserListModal from 'components/artist/UserListModal'
import { getUsers } from 'store/cache/users/selectors'
import { profilePage } from 'utils/route'
import { ID } from 'models/common/Identifiers'

import { getNotificationUserList } from 'containers/notification/store/selectors'
import { fetchNotificationUsers } from 'containers/notification/store/actions'
import DynamicImage from 'components/dynamic-image/DynamicImage'
import { useUserProfilePicture } from 'hooks/useImageSize'
import { SquareSizes } from 'models/common/ImageSizes'

import styles from './UserHeader.module.css'

export const UserImage = ({
  user,
  className,
  onProfileClick
}: {
  user: User
  onProfileClick: (handle: string) => void
  className?: string
}) => {
  const profilePicture = useUserProfilePicture(
    user.user_id,
    user._profile_picture_sizes,
    SquareSizes.SIZE_150_BY_150
  )

  const onClick = useCallback(
    e => {
      e.stopPropagation()
      onProfileClick(user.handle)
    },
    [onProfileClick, user.handle]
  )
  return (
    <ArtistPopover handle={user.handle}>
      <div onClick={onClick} className={className}>
        <DynamicImage
          wrapperClassName={styles.profilePictureWrapper}
          className={styles.profilePicture}
          image={profilePicture}
        />
      </div>
    </ArtistPopover>
  )
}

const USER_LENGTH_LIMIT = 10

type OwnProps = {
  id: string
  userIds: Array<ID>
  users: Array<User>
  isRead: boolean
  userListHeader: string
  userListModalVisible: boolean
  onOpenUserListModal: () => void
  onCloseUserListModal: () => void
  toggleNotificationPanel: () => void
  onProfileClick: (handle: string) => void
}

type UserHeaderProps = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

const UserHeader = ({
  id,
  userIds,
  users,
  modalUsers,
  status,
  isRead,
  loadMore,
  userListHeader,
  hasMore,
  userListModalVisible,
  onOpenUserListModal,
  onCloseUserListModal,
  toggleNotificationPanel,
  onProfileClick,
  goToRoute
}: UserHeaderProps) => {
  useEffect(() => {
    if (userListModalVisible) loadMore()
  }, [userListModalVisible, loadMore])

  const onClickContainer = useCallback(
    e => {
      e.stopPropagation()
      if (!userListModalVisible) onOpenUserListModal()
    },
    [userListModalVisible, onOpenUserListModal]
  )
  const goToProfileRoute = useCallback(
    (handle: string) => {
      goToRoute(profilePage(handle))
      toggleNotificationPanel()
    },
    [goToRoute, toggleNotificationPanel]
  )
  const showUserListModal = userIds.length > USER_LENGTH_LIMIT
  return (
    <div
      className={cn(styles.userHeader, { [styles.notRead]: !isRead })}
      onClick={onClickContainer}
    >
      {users!
        .slice(0, showUserListModal ? USER_LENGTH_LIMIT - 1 : USER_LENGTH_LIMIT)
        .map(user => (
          <UserImage
            className={cn(styles.userImage, styles.userHeaderImage)}
            key={user.user_id}
            user={user}
            onProfileClick={onProfileClick}
          />
        ))}
      {showUserListModal && (
        <Tooltip text={'View All'} mount='body'>
          <div
            className={cn(styles.userImage, styles.userImageCount)}
            onClick={(evt: MouseEvent) => {
              evt.stopPropagation()
              onOpenUserListModal()
            }}
          >
            {`+${formatCount(userIds.length - USER_LENGTH_LIMIT + 1)}`}
          </div>
        </Tooltip>
      )}
      <UserListModal
        id={id}
        loadMore={loadMore}
        initialLoad={true}
        title={userListHeader}
        visible={userListModalVisible}
        onClose={onCloseUserListModal}
        users={modalUsers}
        loading={status === Status.LOADING}
        hasMore={hasMore}
        onClickArtistName={goToProfileRoute}
      />
    </div>
  )
}

function mapStateToProps(state: AppState) {
  const { limit, userIds, status } = getNotificationUserList(state)
  const users = getUsers(state, { ids: userIds })
  return {
    modalUsers: userIds.slice(0, limit).map(id => users[id]),
    hasMore: userIds.length > limit,
    status
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    goToRoute: (route: string) => dispatch(pushRoute(route)),
    loadMore: (limit?: number) => dispatch(fetchNotificationUsers(limit))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(UserHeader))
