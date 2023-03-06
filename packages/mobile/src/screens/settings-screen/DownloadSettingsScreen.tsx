import { settingsPageActions } from '@audius/common'
import { useDispatch } from 'react-redux'
import { useEffectOnce } from 'react-use'

import { Screen, ScreenContent } from 'app/components/core'
import { remindUserToTurnOnNotifications } from 'app/components/notification-reminder/NotificationReminder'

import { Divider } from './Divider'
import { DownloadNetworkPreferenceRow } from './DownloadNetworkPreferenceRow'

const { getPushNotificationSettings, getNotificationSettings } =
  settingsPageActions

const messages = {
  title: 'Notifications',
  enablePn: 'Enable Push Notifications',
  milestones: 'Milestones and Achievements',
  followers: 'New Followers',
  reposts: 'Reposts',
  favorites: 'Favorites',
  remixes: 'Remixes of My Tracks',
  messages: 'Messages'
}

export const DownloadSettingsScreen = () => {
  const dispatch = useDispatch()

  useEffectOnce(() => {
    dispatch(getPushNotificationSettings())
    dispatch(getNotificationSettings())
    remindUserToTurnOnNotifications(dispatch)
  })

  return (
    <Screen title={messages.title} variant='secondary' topbarRight={null}>
      <ScreenContent>
        <Divider />
        <DownloadNetworkPreferenceRow />
      </ScreenContent>
    </Screen>
  )
}
