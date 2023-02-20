import { useCallback } from 'react'

import type { TierChangeNotification as TierChangeNotificationType } from '@audius/common'
import { usersSelectors } from '@audius/common'
import { fullProfilePage } from 'audius-client/src/utils/route'
import { useSelector } from 'react-redux'

import IconBronzeBadge from 'app/assets/images/IconBronzeBadge.svg'
import IconGoldBadge from 'app/assets/images/IconGoldBadge.svg'
import IconPlatinumBadge from 'app/assets/images/IconPlatinumBadge.svg'
import IconSilverBadge from 'app/assets/images/IconSilverBadge.svg'
import { useNotificationNavigation } from 'app/hooks/useNotificationNavigation'

import {
  NotificationTile,
  NotificationHeader,
  NotificationTitle,
  NotificationText,
  NotificationTwitterButton
} from '../Notification'
const { getUser } = usersSelectors

const messages = {
  unlocked: 'Tier Unlocked',
  congrats: (tierLabel: string, amount: number) =>
    `Congrats, you’ve reached ${tierLabel} Tier by having over ${amount} $AUDIO! You now have access to exclusive features & a shiny new badge by your name.`,
  twitterShareText: (tier: string, icon: string) =>
    `I've reached ${tier} Tier on @AudiusProject! Check out the shiny new badge next to my name ${icon}`
}

const tierInfoMap = {
  none: {
    icon: IconBronzeBadge,
    label: 'None',
    amount: 0,
    twitterIcon: ''
  },
  bronze: {
    icon: IconBronzeBadge,
    label: 'Bronze',
    amount: 10,
    twitterIcon: '🥉'
  },
  silver: {
    icon: IconSilverBadge,
    label: 'Silver',
    amount: 100,
    twitterIcon: '🥈'
  },
  gold: {
    icon: IconGoldBadge,
    label: 'Gold',
    amount: 10000,
    twitterIcon: '🥇'
  },
  platinum: {
    icon: IconPlatinumBadge,
    label: 'Platinum',
    amount: 100000,
    twitterIcon: '🥇'
  }
}

type TierChangeNotificationProps = {
  notification: TierChangeNotificationType
}

export const TierChangeNotification = (props: TierChangeNotificationProps) => {
  const { notification } = props
  const { tier, userId } = notification
  const navigation = useNotificationNavigation()
  const user = useSelector((state) => getUser(state, { id: userId }))
  const { icon, label, amount, twitterIcon } = tierInfoMap[tier]

  const handlePress = useCallback(() => {
    navigation.navigate(notification)
  }, [navigation, notification])

  if (!user) return null

  return (
    <NotificationTile notification={notification} onPress={handlePress}>
      <NotificationHeader icon={icon}>
        <NotificationTitle style={{ textTransform: 'uppercase' }}>
          {label} {messages.unlocked}
        </NotificationTitle>
      </NotificationHeader>
      <NotificationText>{messages.congrats(label, amount)}</NotificationText>
      <NotificationTwitterButton
        type='static'
        url={fullProfilePage(user.handle)}
        shareText={messages.twitterShareText(label, twitterIcon)}
      />
    </NotificationTile>
  )
}
