import type { Credentials, UseTikTokAuthArguments } from '@audius/common'
import { createUseTikTokAuthHook } from '@audius/common'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CookieManager from '@react-native-community/cookies'
import Config from 'react-native-config'
import {
  init as tikTokInit,
  auth as tikTokAuth,
  events as tikTokEvents
} from 'react-native-tiktok'

import { track, make } from 'app/services/analytics'
import { EventNames } from 'app/types/analytics'

export const useTikTokAuth = (args: UseTikTokAuthArguments) => {
  return createUseTikTokAuthHook({
    authenticate: async () => {
      return new Promise<Credentials>((resolve, reject) => {
        track(
          make({
            eventName: EventNames.TIKTOK_START_OAUTH
          })
        )

        // Needed for Android
        const authListener = tikTokEvents.addListener(
          'onAuthCompleted',
          (resp) => {
            resolve(resp)
          }
        )

        return CookieManager.set(Config.IDENTITY_SERVICE, {
          name: 'csrfState',
          value: 'true',
          secure: true
        }).then(() => {
          tikTokInit(Config.TIKTOK_APP_ID)
          tikTokAuth(async (code, error, errorMessage) => {
            // TODO handle error

            const response = await fetch(
              `${Config.IDENTITY_SERVICE}/tiktok/access_token`,
              {
                credentials: 'include',
                method: 'POST',
                body: JSON.stringify({
                  code,
                  state: 'true'
                }),
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            )

            if (!response.ok) {
              reject(new Error(response.status + ' ' + (await response.text())))
            }

            const {
              data: { access_token, open_id, expires_in }
            } = await response.json()

            resolve({
              accessToken: access_token,
              openId: open_id,
              expiresIn: expires_in
            })
          })
        })
      })
    },
    handleError: (e: Error) => {
      track(
        make({
          eventName: EventNames.TIKTOK_OAUTH_ERROR,
          error: e.message
        })
      )
    },
    getLocalStorageItem: AsyncStorage.getItem,
    setLocalStorageItem: AsyncStorage.setItem
  })(args)
}
