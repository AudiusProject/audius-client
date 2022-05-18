import React, { useCallback } from 'react'

import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { Follow } from 'common/store/notifications/types'
import { formatCount } from 'common/utils/formatUtil'
import {
  setUsers as setUserListUsers,
  setVisibility as openUserListModal
} from 'store/application/ui/userListModal/slice'
import {
  UserListEntityType,
  UserListType
} from 'store/application/ui/userListModal/types'
import { isMobile } from 'utils/clientUtil'
import { profilePage } from 'utils/route'

import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { UserNameLink } from './components/UserNameLink'
import { UserProfilePictureList } from './components/UserProfilePictureList'
import { IconFollow } from './components/icons'

const messages = {
  others: (userCount: number) =>
    ` and ${formatCount(userCount)} other${userCount > 1 ? 's' : ''}`,
  followed: ' followed you'
}

type FollowNotificationProps = {
  notification: Follow
}

export const FollowNotification = (props: FollowNotificationProps) => {
  const { notification } = props
  const { id, users, userIds, timeLabel, isViewed } = notification
  const [firstUser] = users
  const otherUsersCount = userIds.length - 1
  const isMultiUser = userIds.length > 1
  const dispatch = useDispatch()

  const handleClick = useCallback(() => {
    if (isMultiUser) {
      dispatch(
        setUserListUsers({
          userListType: UserListType.NOTIFICATION,
          entityType: UserListEntityType.USER,
          id: (id as unknown) as number
        })
      )
      if (isMobile()) {
        dispatch(push(`notification/${id}/users`))
      } else {
        dispatch(openUserListModal(true))
      }
    } else {
      dispatch(push(profilePage(firstUser.handle)))
    }
  }, [isMultiUser, dispatch, id, firstUser.handle])

  return (
    <NotificationTile
      notification={notification}
      onClick={handleClick}
      disableClosePanel={isMultiUser}
    >
      <NotificationHeader icon={<IconFollow />}>
        <UserProfilePictureList users={users} totalUserCount={userIds.length} />
      </NotificationHeader>
      <NotificationBody>
        <UserNameLink user={firstUser} notification={notification} />
        {otherUsersCount > 0 ? messages.others(otherUsersCount) : null}
        {messages.followed}
      </NotificationBody>
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
