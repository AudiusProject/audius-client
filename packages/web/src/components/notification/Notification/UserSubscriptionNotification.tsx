import React, { useCallback } from 'react'

import { push } from 'connected-react-router'
import { useDispatch } from 'react-redux'

import { Name } from 'common/models/Analytics'
import { Entity, UserSubscription } from 'common/store/notifications/types'
import { make, useRecord } from 'store/analytics/actions'
import { profilePage } from 'utils/route'

import styles from './UserSubscriptionNotification.module.css'
import { EntityLink } from './components/EntityLink'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { ProfilePicture } from './components/ProfilePicture'
import { UserNameLink } from './components/UserNameLink'
import { IconRelease } from './components/icons'
import { getEntityLink } from './utils'

const messages = {
  title: 'New Release',
  posted: 'posted',
  new: 'new'
}

type UserSubscriptionNotificationProps = {
  notification: UserSubscription
}

export const UserSubscriptionNotification = (
  props: UserSubscriptionNotificationProps
) => {
  const { notification } = props
  const { user, entities, entityType, timeLabel, isViewed, type } = notification
  const dispatch = useDispatch()
  const record = useRecord()

  const entitiesCount = entities.length

  const singleEntity = entitiesCount === 1

  const handleClick = useCallback(() => {
    if (entityType === Entity.Track && !singleEntity) {
      dispatch(push(profilePage(user.handle)))
    } else {
      const entityLink = getEntityLink(entities[0])
      dispatch(push(entityLink))
      record(
        make(Name.NOTIFICATIONS_CLICK_TILE, { kind: type, link_to: entityLink })
      )
    }
  }, [entityType, singleEntity, user, entities, dispatch, record, type])

  return (
    <NotificationTile notification={notification} onClick={handleClick}>
      <NotificationHeader icon={<IconRelease />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody>
        <div className={styles.body}>
          <ProfilePicture className={styles.profilePicture} user={user} />
          <span>
            <UserNameLink user={user} notification={notification} />{' '}
            {messages.posted} {singleEntity ? 'a' : entitiesCount}{' '}
            {messages.new} {entityType.toLowerCase()}
            {singleEntity ? '' : 's'}{' '}
            {singleEntity ? (
              <EntityLink entity={entities[0]} entityType={entityType} />
            ) : null}
          </span>
        </div>
      </NotificationBody>
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
