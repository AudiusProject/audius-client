import { MouseEventHandler, useCallback } from 'react'

import { Name, User, Notification } from '@audius/common'
import cn from 'classnames'
import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { make, useRecord } from 'common/store/analytics/actions'
import { ArtistPopover } from 'components/artist/ArtistPopover'
import UserBadges from 'components/user-badges/UserBadges'
import { closeNotificationPanel } from 'store/application/ui/notifications/notificationsUISlice'
import { isMobile } from 'utils/clientUtil'
import { profilePage } from 'utils/route'

import styles from './UserNameLink.module.css'

const messages = {
  deactivated: 'Deactivated'
}

type UserNameLinkProps = {
  className?: string
  notification: Notification
  user: User
}

export const UserNameLink = (props: UserNameLinkProps) => {
  const { className, notification, user } = props
  const dispatch = useDispatch()

  const record = useRecord()
  const { type } = notification
  const { handle, user_id, name, is_deactivated } = user

  const profileLink = profilePage(handle)

  const handleNavigateAway = useCallback(() => {
    dispatch(closeNotificationPanel())
  }, [dispatch])

  const handleClick: MouseEventHandler = useCallback(
    (event) => {
      event.stopPropagation()
      event.preventDefault()
      handleNavigateAway()
      dispatch(push(profilePage(handle)))
      record(
        make(Name.NOTIFICATIONS_CLICK_TILE, {
          kind: type,
          link_to: profileLink
        })
      )
    },
    [dispatch, handle, record, type, profileLink, handleNavigateAway]
  )

  const rootClassName = cn(styles.root, className)

  if (is_deactivated) {
    return (
      <span className={cn(rootClassName, styles.deactivated)}>
        {name} [{messages.deactivated}]
      </span>
    )
  }

  let userNameElement = (
    <span className={rootClassName}>
      <a onClick={handleClick} href={profileLink} className={styles.link}>
        {name}
      </a>
      <UserBadges
        inline
        userId={user_id}
        badgeSize={12}
        className={styles.badges}
        noContentClassName={styles.badgesNoContent}
      />
    </span>
  )

  if (!isMobile()) {
    userNameElement = (
      <ArtistPopover
        handle={handle}
        component='span'
        onNavigateAway={handleNavigateAway}
      >
        {userNameElement}
      </ArtistPopover>
    )
  }

  return userNameElement
}
