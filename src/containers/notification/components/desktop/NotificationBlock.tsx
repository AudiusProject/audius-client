import React, { useState, useCallback } from 'react'
import cn from 'classnames'
import { formatCount } from 'utils/formatUtil'
import {
  Entity,
  NotificationType,
  Achievement
} from 'containers/notification/store/types'
import { ID } from 'models/common/Identifiers'
import Track from 'models/Track'

import { profilePage } from 'utils/route'
import { make, useRecord } from 'store/analytics/actions'
import { Name } from 'services/analytics'
import { getEntityLink, TwitterShare } from '../TwitterShare'

import Menu from 'containers/menu/Menu'
import { ReactComponent as IconKebabHorizontal } from 'assets/img/iconKebabHorizontal.svg'

import { OwnProps as NotificationMenuProps } from 'containers/menu/NotificationMenu'
import styles from './NotificationBlock.module.css'
import UserHeader, { UserImage } from './UserHeader'
import { formatHeader, formatBody } from '../formatText'
import TrackContent from '../TrackContent'

// The number of users thumbnail images to show in the top row
// if there are multiple users associated w/ the notification
export const USER_LENGTH_LIMIT = 9

export type NotificationBlockProps = {
  body?: React.ReactNode
  timeLabel: string
  notification: any
  goToRoute: (route: string) => void
  toggleNotificationPanel: () => void
  menuProps: NotificationMenuProps
  markAsRead: (notificationId: string) => void
  setNotificationUsers: (userIds: ID[], limit: number) => void
  onClick?: () => void
}

const NotificationBlock = (props: NotificationBlockProps) => {
  const { goToRoute, markAsRead, notification, toggleNotificationPanel } = props
  const record = useRecord()

  const {
    user,
    users,
    userIds,
    isRead,
    id,
    type,
    entity,
    entities
  } = notification
  const isMultiUser = !!users && users.length > 1
  const isSingleUser = !isMultiUser && (!!users || !!user)
  const [userListModalVisible, setUserListModalVisible] = useState(false)

  const markNotificationAsRead = useCallback(() => {
    markAsRead(id)
  }, [markAsRead, id])

  const onOpenUserListModal = () => {
    props.setNotificationUsers(userIds, USER_LENGTH_LIMIT)
    setUserListModalVisible(true)
    markNotificationAsRead()
  }

  const onCloseUserListModal = () => {
    setUserListModalVisible(false)
  }
  const goToEntityPage = (entity: any) => {
    const page = getEntityLink(entity)
    props.toggleNotificationPanel()
    props.goToRoute(page)
    record(make(Name.NOTIFICATIONS_CLICK_TILE, { kind: type, link_to: page }))
  }
  const onProfileClick = useCallback(
    (handle: string) => {
      toggleNotificationPanel()
      goToRoute(profilePage(handle))
      record(
        make(Name.NOTIFICATIONS_CLICK_TILE, {
          kind: type,
          link_to: profilePage(handle)
        })
      )
    },
    [record, type, toggleNotificationPanel, goToRoute]
  )

  const header = formatHeader(props.notification, goToEntityPage)

  const body = formatBody(props.notification, onProfileClick, goToEntityPage)
  const trackContent =
    notification.type === NotificationType.RemixCosign ? (
      <TrackContent
        notification={props.notification}
        goToEntityPage={goToEntityPage}
      />
    ) : null
  const onContainerClick = () => {
    markNotificationAsRead()
    switch (type) {
      case NotificationType.Favorite:
      case NotificationType.Repost: {
        goToEntityPage(entity)
        break
      }
      case NotificationType.Follow: {
        if (isMultiUser) onOpenUserListModal()
        else {
          const user = users[0]
          onProfileClick(user.handle)
        }
        break
      }
      case NotificationType.UserSubscription: {
        if (
          props.notification.entityType === Entity.Track &&
          entities.length > 1
        ) {
          props.goToRoute(profilePage(user.handle))
        } else {
          goToEntityPage(entities[0])
        }
        break
      }
      case NotificationType.Milestone: {
        if (props.notification.achievement === Achievement.Followers) {
          props.goToRoute(profilePage(user.handle))
        } else {
          goToEntityPage(entity)
        }
        break
      }
      case NotificationType.TrendingTrack: {
        goToEntityPage(entity)
        break
      }
      case NotificationType.RemixCreate:
      case NotificationType.RemixCosign: {
        const childTrack = notification.entities.find(
          (track: Track) => track.track_id === notification.childTrackId
        )
        goToEntityPage(childTrack)
        break
      }
    }
  }

  const getUserListHeader = useCallback(
    (notificationType: NotificationType, count: number) => {
      if (notificationType === NotificationType.Follow) {
        return `${formatCount(count)} new followers`
      }
      return `${formatCount(count)} ${notificationType.toLowerCase()}s`
    },
    []
  )

  const onMenuClick = useCallback(
    e => {
      e.stopPropagation()
      markNotificationAsRead()
    },
    [markNotificationAsRead]
  )
  const shouldShowUserImage =
    isSingleUser &&
    !(
      type === NotificationType.Milestone &&
      props.notification.achievement === Achievement.Followers
    ) &&
    !(type === NotificationType.TrendingTrack)

  return (
    <div
      className={cn(styles.container, { [styles.unRead]: !isRead })}
      onClick={onContainerClick}
    >
      <div className={styles.unReadDot}></div>
      {isMultiUser && (
        <UserHeader
          id={notification.id}
          isRead={isRead}
          users={users!}
          userIds={userIds}
          userListHeader={getUserListHeader(
            props.notification.type,
            userIds.length
          )}
          onProfileClick={onProfileClick}
          userListModalVisible={userListModalVisible}
          onOpenUserListModal={onOpenUserListModal}
          toggleNotificationPanel={props.toggleNotificationPanel}
          onCloseUserListModal={onCloseUserListModal}
        />
      )}
      {header && (
        <div className={styles.headerContainer}>
          {header}
          <div className={styles.menuContainer} onClick={onMenuClick}>
            <Menu menu={props.menuProps}>
              <div className={styles.iconContainer}>
                <IconKebabHorizontal className={styles.iconKebabHorizontal} />
              </div>
            </Menu>
          </div>
        </div>
      )}
      <div className={styles.bodyContainer}>
        {shouldShowUserImage && (
          <UserImage
            className={styles.singleUserImage}
            user={users ? users![0] : user!}
            onProfileClick={onProfileClick}
          />
        )}
        <div className={styles.body}>{body}</div>
        {!header && (
          <div className={styles.menuContainer} onClick={onMenuClick}>
            <Menu menu={props.menuProps}>
              <div className={styles.iconContainer}>
                <IconKebabHorizontal className={styles.iconKebabHorizontal} />
              </div>
            </Menu>
          </div>
        )}
      </div>
      {trackContent}
      {(type === NotificationType.Milestone ||
        type === NotificationType.TrendingTrack ||
        type === NotificationType.RemixCosign ||
        type === NotificationType.RemixCreate) && (
        <TwitterShare
          notification={props.notification}
          markNotificationAsRead={markNotificationAsRead}
        />
      )}
      {props.body && <div>{props.body}</div>}
      <div className={styles.timeLabel}>{props.timeLabel}</div>
    </div>
  )
}

export default NotificationBlock
