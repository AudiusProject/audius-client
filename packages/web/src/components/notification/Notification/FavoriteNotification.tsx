import { MouseEventHandler, useCallback } from 'react'

import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import {
  getNotificationEntity,
  getNotificationUsers
} from 'common/store/notifications/selectors'
import { Favorite } from 'common/store/notifications/types'
import {
  setUsers as setUserListUsers,
  setVisibility as openUserListModal
} from 'store/application/ui/userListModal/slice'
import { UserListType } from 'store/application/ui/userListModal/types'
import { isMobile } from 'utils/clientUtil'
import { useSelector } from 'utils/reducer'

import { EntityLink, useGoToEntity } from './components/EntityLink'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { OthersLink } from './components/OthersLink'
import { UserNameLink } from './components/UserNameLink'
import { UserProfilePictureList } from './components/UserProfilePictureList'
import { IconFavorite } from './components/icons'
import { entityToUserListEntity, USER_LENGTH_LIMIT } from './utils'

const messages = {
  favorited: ' favorited your '
}

type FavoriteNotificationProps = {
  notification: Favorite
}
export const FavoriteNotification = (props: FavoriteNotificationProps) => {
  const { notification } = props
  const { id, userIds, entityType, timeLabel, isViewed } = notification
  const users = useSelector((state) =>
    getNotificationUsers(state, notification, USER_LENGTH_LIMIT)
  )
  const firstUser = users?.[0]
  const otherUsersCount = userIds.length - 1
  const isMultiUser = userIds.length > 1

  const entity = useSelector((state) =>
    getNotificationEntity(state, notification)
  )

  const dispatch = useDispatch()

  const handleGoToEntity = useGoToEntity(entity, entityType)

  const handleClick: MouseEventHandler = useCallback(
    (event) => {
      if (isMultiUser) {
        dispatch(
          setUserListUsers({
            userListType: UserListType.NOTIFICATION,
            entityType: entityToUserListEntity[entityType],
            id: id as unknown as number
          })
        )
        if (isMobile()) {
          dispatch(push(`notification/${id}/users`))
        } else {
          dispatch(openUserListModal(true))
        }
      } else {
        handleGoToEntity(event)
      }
    },
    [isMultiUser, dispatch, entityType, id, handleGoToEntity]
  )

  if (!users || !firstUser || !entity) return null

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconFavorite />}>
        <UserProfilePictureList
          users={users}
          totalUserCount={userIds.length}
          stopPropagation
        />
      </NotificationHeader>
      <NotificationBody>
        <UserNameLink user={firstUser} notification={notification} />{' '}
        {otherUsersCount > 0 ? (
          <OthersLink othersCount={otherUsersCount} onClick={handleClick} />
        ) : null}
        {messages.favorited}
        {entityType.toLowerCase()}{' '}
        <EntityLink entity={entity} entityType={entityType} />
      </NotificationBody>
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
