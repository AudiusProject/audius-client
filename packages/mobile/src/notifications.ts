import { Platform } from 'react-native'
// https://dev.to/edmondso006/react-native-local-ios-and-android-notifications-2c58
import PushNotification from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import AsyncStorage from '@react-native-community/async-storage'
import WebView from 'react-native-webview'

import { MessageType } from './message'
import { URL_SCHEME } from 'components/web/WebApp'
import { postMessage } from './utils/postMessage'
import { RefObject } from 'react'
import { MessagePostingWebView } from './types/MessagePostingWebView'
import Config from "react-native-config"
import { track, make } from './utils/analytics'
import { EventNames } from './types/analytics'

type Token = {
  token: string
  os: string
}

// Set to true while the push notification service is registering with the os
let isRegistering = false
// Reference to hold the web ref to push routes to
let webRef: RefObject<MessagePostingWebView>

const getPlatformConfiguration = () => {
  if (Platform.OS === 'android') {
    console.info('Fcm Sender ID:', Config.FCM_SENDER_ID)
    return {
      senderID: Config.FCM_SENDER_ID,
      requestPermissions: true,
      largeIcon: "ic_launcher",
      smallIcon: "ic_notification"
    }

  }
  else {
    return {
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      // Turn the initial permissions request off
      requestPermissions: false
    }

  }

}

// Singleton class
class PushNotifications {
  lastId: number
  token: Token | null

  // onNotification is a function passed in that is to be called when a
  // notification is to be emitted.
  constructor () {
    this.configure()
    this.lastId = 0
    this.token = null
  }

  setWebRef (w: RefObject<MessagePostingWebView>) {
    webRef = w
  }

  onNotification (notification: any) {
    console.info(`Received notification ${JSON.stringify(notification)}`)
    if (notification.userInteraction || Platform.OS === 'android') {
      track(make({
        eventName: EventNames.NOTIFICATIONS_OPEN_PUSH_NOTIFICATION,
        ...(notification.message ? {
          title: notification.message.title,
          body: notification.message.body
        } : {})
      }))

      if (!webRef || !webRef.current) return

      postMessage(webRef.current, {
          type: MessageType.PUSH_ROUTE,
          // TODO: Be smarter about the notifs deep linking
          // route: `/${url.replace(URL_SCHEME, '')}`,
          route: '/notifications',
          isAction: true
      })
    }
  }

  async onRegister (token: Token) {
    console.log("REGISTER DEVICE TOKEN", token)
    this.token = token
    await AsyncStorage.setItem('@device_token', JSON.stringify(token))
    isRegistering = false
  }

  deregister () {
    AsyncStorage.removeItem('@device_token')
  }

  async configure () {
    PushNotification.configure({
      onNotification: this.onNotification,
      onRegister: this.onRegister,

      popInitialNotification: false,
      ...getPlatformConfiguration()
    })

    try {
      const token = await AsyncStorage.getItem('@device_token')
      if (token) {
        this.token = JSON.parse(token)
      } else {
        console.info(`Device token not found`)
      }
    } catch (e) {
      console.error(`Device token read error`)
    }
  }

  requestPermission () {
    isRegistering = true
    PushNotification.requestPermissions()
  }

  checkPermission (callback: () => void) {
    return PushNotification.checkPermissions(callback)
  }

  cancelNotif () {
    PushNotification.cancelLocalNotifications({ id: '' + this.lastId })
  }

  cancelAll () {
    PushNotification.cancelAllLocalNotifications()
  }

  setBadgeCount (count: number) {
    PushNotification.setApplicationIconBadgeNumber(count)
  }

  async getToken () {
    // Wait until the device token and OS are persisted to async storage
    while (isRegistering) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    const token = await AsyncStorage.getItem('@device_token')
    if (token) {
      return JSON.parse(token)
    }
    return {}
  }
}

const notifications = new PushNotifications()

export default notifications