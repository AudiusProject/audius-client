import { useCallback } from 'react'

import type {
  User,
  Nullable,
  EntityType,
  MilestoneNotification as MilestoneNotificationType
} from '@audius/common'
import { notificationsSelectors, Achievement } from '@audius/common'
import { fullProfilePage } from 'audius-client/src/utils/route'
import { useSelector } from 'react-redux'

import IconTrophy from 'app/assets/images/iconTrophy.svg'
import { make } from 'app/services/analytics'
import { EventNames } from 'app/types/analytics'
import { formatCount } from 'app/utils/format'

import {
  EntityLink,
  NotificationHeader,
  NotificationText,
  NotificationTile,
  NotificationTitle,
  NotificationTwitterButton
} from '../Notification'
import { getEntityRoute, getEntityScreen } from '../Notification/utils'
import { useDrawerNavigation } from '../useDrawerNavigation'
const { getNotificationEntity, getNotificationUser } = notificationsSelectors

const messages = {
  title: 'Milestone Reached!',
  follows: 'You have reached over',
  your: 'Your',
  reached: 'has reached over',
  followerAchievementText: (followersCount: number) =>
    `I just hit over ${followersCount} followers on @AudiusProject #Audius!`,
  achievementText: (
    type: string,
    name: string,
    value: number,
    achievement: string
  ) => {
    const achievementText =
      achievement === Achievement.Listens ? 'plays' : achievement
    return `My ${type} ${name} has more than ${value} ${achievementText} on @AudiusProject #Audius
Check it out!`
  }
}

const getTwitterShareData = (
  notification: MilestoneNotificationType,
  entity?: Nullable<EntityType>,
  user?: Nullable<User>
) => {
  const { achievement, value } = notification
  switch (achievement) {
    case Achievement.Followers: {
      if (user) {
        const link = fullProfilePage(user.handle)
        const text = messages.followerAchievementText(value)
        return { text, link }
      }
      return { text: '', link: '' }
    }
    case Achievement.Favorites:
    case Achievement.Listens:
    case Achievement.Reposts: {
      if (entity) {
        const { entityType } = notification
        const link = getEntityRoute(entity, true)
        const text = messages.achievementText(
          entityType,
          'title' in entity ? entity.title : entity.playlist_name,
          value,
          achievement
        )
        return { text, link }
      }
      return { text: '', link: '' }
    }
    default: {
      return { text: '', link: '' }
    }
  }
}

type MilestoneNotificationProps = {
  notification: MilestoneNotificationType
}

export const MilestoneNotification = (props: MilestoneNotificationProps) => {
  const { notification } = props
  const { achievement } = notification
  const entity = useSelector((state) =>
    getNotificationEntity(state, notification)
  )
  const user = useSelector((state) => getNotificationUser(state, notification))

  const navigation = useDrawerNavigation()

  const handlePress = useCallback(() => {
    if (achievement === Achievement.Followers) {
      if (user) {
        navigation.navigate('Profile', {
          handle: user.handle,
          fromNotifications: true
        })
      }
    } else {
      if (entity) {
        const [screen, params] = getEntityScreen(entity)
        navigation.navigate(screen, params)
      }
    }
  }, [achievement, user, navigation, entity])

  const renderBody = () => {
    const { achievement, value } = notification
    if (achievement === Achievement.Followers) {
      return `${messages.follows} ${formatCount(value)} ${achievement}`
    } else if (entity) {
      const { entityType } = notification
      const achievementText =
        achievement === Achievement.Listens ? 'plays' : achievement

      return (
        <>
          {messages.your} {entityType} <EntityLink entity={entity} />{' '}
          {messages.reached} {formatCount(value)} {achievementText}
        </>
      )
    }
    return null
  }

  const isMissingRequiredUser = achievement === Achievement.Followers && !user
  const isMissingRequiredEntity =
    achievement !== Achievement.Followers && !entity

  if (isMissingRequiredUser || isMissingRequiredEntity) {
    return null
  }

  const { link, text } = getTwitterShareData(notification, entity, user)

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={IconTrophy}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationText>{renderBody()}</NotificationText>
      <NotificationTwitterButton
        type='static'
        url={link}
        shareText={text}
        analytics={make({
          eventName: EventNames.NOTIFICATIONS_CLICK_MILESTONE_TWITTER_SHARE,
          milestone: text
        })}
      />
    </NotificationTile>
  )
}
