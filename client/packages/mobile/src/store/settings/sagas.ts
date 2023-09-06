import type { PushNotifications as TPushNotifications } from '@audius/common'
import {
  getErrorMessage,
  accountSelectors,
  settingsPageInitialState as initialState,
  settingsPageSelectors,
  PushNotificationSetting,
  settingsPageActions as actions,
  getContext,
  waitForValue,
  waitForAccount,
  settingsPageActions
} from '@audius/common'
import { waitForRead } from 'audius-client/src/utils/sagaHelpers'
import commonSettingsSagas from 'common/store/pages/settings/sagas'
import { mapValues } from 'lodash'
import { RESULTS, checkNotifications } from 'react-native-permissions'
import { select, call, put, takeEvery, take } from 'typed-redux-saga'

import PushNotifications from 'app/notifications'

import { setVisibility } from '../drawers/slice'

const { getPushNotificationSettings, SET_PUSH_NOTIFICATION_SETTINGS } =
  settingsPageActions
const { getPushNotificationSettings: selectPushNotificationSettings } =
  settingsPageSelectors
const { getAccountUser, getHasAccount } = accountSelectors

function* getIsMobilePushEnabled() {
  yield* put(getPushNotificationSettings())
  yield* take(SET_PUSH_NOTIFICATION_SETTINGS)
  const { [PushNotificationSetting.MobilePush]: isMobilePushEnabled } =
    yield* select(selectPushNotificationSettings)
  return isMobilePushEnabled
}

export function* deregisterPushNotifications() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const { token } = yield* call([PushNotifications, 'getToken'])
  PushNotifications.deregister()
  yield* call(audiusBackendInstance.deregisterDeviceToken, token)
}

function* registerDeviceToken() {
  let { token, os } = yield* call([PushNotifications, 'getToken'])

  if (!token) {
    yield* call([PushNotifications, 'requestPermission'])
    ;({ token, os } = yield* call([PushNotifications, 'getToken']))
  }

  const audiusBackend = yield* getContext('audiusBackendInstance')
  yield* call(audiusBackend.registerDeviceToken, token, os)
}

function* reregisterDeviceTokenOnStartup() {
  yield* call(waitForAccount)
  const isSignedIn = yield* select(getHasAccount)
  if (!isSignedIn) return

  const { status } = yield* call(checkNotifications)
  const isMobilePushEnabled = yield* call(getIsMobilePushEnabled)

  if (
    (status === RESULTS.GRANTED || status === RESULTS.LIMITED) &&
    isMobilePushEnabled
  ) {
    yield* call(registerDeviceToken)
  }
}

function* enablePushNotifications() {
  yield* call(registerDeviceToken)

  const audiusBackendInstance = yield* getContext('audiusBackendInstance')

  // Enabling push notifications should enable all of the notification types
  const newSettings = { ...initialState.pushNotifications }
  yield* put(actions.setPushNotificationSettings(newSettings))

  // We need a user for this to work (and in the case of sign up, we might not
  // have one right away when this function is called)
  yield* call(waitForValue, getAccountUser)
  yield* call(audiusBackendInstance.updatePushNotificationSettings, newSettings)
}

function* disablePushNotifications() {
  const audiusBackendInstance = yield* getContext('audiusBackendInstance')
  const newSettings = mapValues(
    initialState.pushNotifications,
    function (_val: boolean) {
      return false
    }
  )
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
      const settings = yield* call(
        audiusBackendInstance.getPushNotificationSettings
      )
      let pushNotificationSettings = mapValues(
        initialState.pushNotifications,
        function (_val: boolean) {
          return false
        }
      )

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
            yield* call(enablePushNotifications)
          } else {
            yield* call(disablePushNotifications)
          }
        } else {
          if (isOn === undefined) {
            const pushNotificationSettings = yield* select(
              selectPushNotificationSettings
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

function* watchRequestPushNotificationPermissions() {
  yield* takeEvery(actions.REQUEST_PUSH_NOTIFICATION_PERMISSIONS, function* () {
    const { status } = yield* call(checkNotifications)
    const isMobilePushEnabled = yield* call(getIsMobilePushEnabled)

    if (
      (status === RESULTS.GRANTED || status === RESULTS.LIMITED) &&
      isMobilePushEnabled
    ) {
      yield* call(registerDeviceToken)
    } else if (status === RESULTS.BLOCKED || status === RESULTS.UNAVAILABLE) {
      // do nothing
    } else {
      yield* put(
        setVisibility({ drawer: 'EnablePushNotifications', visible: true })
      )
    }
  })
}

export default function sagas() {
  return [
    ...commonSettingsSagas(),
    reregisterDeviceTokenOnStartup,
    watchGetPushNotificationSettings,
    watchUpdatePushNotificationSettings,
    watchRequestPushNotificationPermissions
  ]
}
