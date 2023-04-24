import type { PushNotifications as TPushNotifications } from '@audius/common'
import {
  getErrorMessage,
  accountSelectors,
  settingsPageInitialState as initialState,
  settingsPageSelectors,
  PushNotificationSetting,
  settingsPageActions as actions,
  getContext,
  waitForValue
} from '@audius/common'
import { waitForRead } from 'audius-client/src/utils/sagaHelpers'
import commonSettingsSagas from 'common/store/pages/settings/sagas'
import { select, call, put, takeEvery } from 'typed-redux-saga'

import PushNotifications from 'app/notifications'

const { getPushNotificationSettings } = settingsPageSelectors
const { getAccountUser } = accountSelectors

export function* deregisterPushNotifications() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const { token } = yield* call([PushNotifications, 'getToken'])
  PushNotifications.deregister()
  yield* call(audiusBackendInstance.deregisterDeviceToken, token)
}

function* enablePushNotifications(enableAll: boolean) {
  yield* call([PushNotifications, 'requestPermission'])
  const { token, os } = yield* call([PushNotifications, 'getToken'])

  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  // initialState reflects db defaults
  const newSettings = { ...initialState.pushNotifications }
  if (enableAll) {
    // Enable all, ignoring defaults. True when user manually toggles the top-level
    // notification setting in the settings page or via the reminder drawer
    for (const key in newSettings) {
      newSettings[key] = true
    }
  }
  yield* put(actions.setPushNotificationSettings(newSettings))
  // We need a user for this to work (and in the case of sign up, we might not
  // have one right away when this function is called)
  yield* call(waitForValue, getAccountUser)
  yield* call(audiusBackendInstance.updatePushNotificationSettings, newSettings)

  yield* call(audiusBackendInstance.registerDeviceToken, token, os)
}

function* disableAllPushNotifications() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const newSettings = { ...initialState.pushNotifications }
  for (const key in newSettings) {
    newSettings[key] = false
  }
  yield* put(actions.setPushNotificationSettings(newSettings))
  yield* call(waitForValue, getAccountUser)
  yield* call(audiusBackendInstance.updatePushNotificationSettings, newSettings)
  yield* call(deregisterPushNotifications)
}

function pushNotificationsEnabled(settings: TPushNotifications): boolean {
  for (const key in initialState.pushNotifications) {
    if (key === PushNotificationSetting.MobilePush) continue
    if (settings[key]) return true
  }
  return false
}

function* watchGetPushNotificationSettings() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* takeEvery(actions.GET_PUSH_NOTIFICATION_SETTINGS, function* () {
    yield* call(waitForRead)
    try {
      const settings = (yield* call(
        audiusBackendInstance.getPushNotificationSettings
      )) as TPushNotifications
      let pushNotificationSettings = { ...initialState.pushNotifications }
      for (const key in pushNotificationSettings) {
        pushNotificationSettings[key] = false
      }

      if (settings) {
        pushNotificationSettings = {
          ...settings,
          [PushNotificationSetting.MobilePush]: yield* call(
            pushNotificationsEnabled,
            settings
          )
        }
      }
      yield* put(actions.setPushNotificationSettings(pushNotificationSettings))
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      console.error(errorMessage)
      yield* put(actions.getPushNotificationSettingsFailed(errorMessage))
    }
  })
}

function* watchUpdatePushNotificationSettings() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  yield* takeEvery(
    actions.TOGGLE_PUSH_NOTIFICATION_SETTING,
    function* (action: actions.TogglePushNotificationSetting) {
      let isOn = action.isOn

      try {
        if (action.notificationType === PushNotificationSetting.MobilePush) {
          if (isOn) {
            yield* call(enablePushNotifications, action.enableAll)
          } else {
            yield* call(disableAllPushNotifications)
          }
        } else {
          if (isOn === undefined) {
            const pushNotificationSettings = yield* select(
              getPushNotificationSettings
            )
            isOn = !pushNotificationSettings[action.notificationType]
          }
          yield* call(audiusBackendInstance.updatePushNotificationSettings, {
            [action.notificationType]: isOn
          })
        }
      } catch (e) {
        yield* put(
          actions.togglePushNotificationSettingFailed(
            action.notificationType,
            action.isOn
          )
        )
      }
    }
  )
}

export default function sagas() {
  return [
    ...commonSettingsSagas(),
    watchGetPushNotificationSettings,
    watchUpdatePushNotificationSettings
  ]
}
