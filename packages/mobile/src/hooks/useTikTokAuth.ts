import type { Credentials, UseTikTokAuthArguments } from '@audius/common'
import { createUseTikTokAuthHook } from '@audius/common'
import AsyncStorage from '@react-native-async-storage/async-storage'
import CookieManager from '@react-native-cookies/cookies'
import { Linking } from 'react-native'
import Config from 'react-native-config'
import {
  init as tikTokInit,
  auth as tikTokAuth,
  events as tikTokEvents
} from 'react-native-tiktok'

import { track, make } from 'app/services/analytics'
import { dispatch } from 'app/store'
import * as oauthActions from 'app/store/oauth/actions'
import { Provider } from 'app/store/oauth/reducer'
import { EventNames } from 'app/types/analytics'

const authenticationUrl = `${Config.IDENTITY_SERVICE}/tiktok`

const canOpenTikTok = () => {
  return Linking.canOpenURL('tiktok://app')
}

const authenticate = async (): Promise<Credentials> => {
  track(
    make({
      eventName: EventNames.TIKTOK_START_OAUTH
    })
  )

  // Perform WebView auth if TikTok is not installed
  // TikTok LoginKit is supposed to handle this but it doesn't seem to work
  if (!(await canOpenTikTok())) {
    return new Promise((resolve, reject) => {
      dispatch(
        oauthActions.requestNativeOpenPopup(
          resolve,
          reject,
          authenticationUrl,
          Provider.TIKTOK
        )
      )
    })
  }

  tikTokInit(Config.TIKTOK_APP_ID)

  return new Promise((resolve, reject) => {
    const handleTikTokAuth = async (
      code: string,
      error: boolean | null,
      errorMessage: string
    ) => {
      if (error) {
        return reject(new Error(errorMessage))
      }

      // Need to set a csrf cookie because it is required for web
      await CookieManager.set(Config.IDENTITY_SERVICE, {
        name: 'csrfState',
        value: 'true'
      })

      try {
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
          return reject(
            new Error(response.status + ' ' + (await response.text()))
          )
        }

        const {
          data: { access_token, open_id, expires_in }
        } = await response.json()

        return resolve({
          accessToken: access_token,
          openId: open_id,
          expiresIn: expires_in
        })
      } catch (e) {
        return reject(e)
      }
    }

    // Needed for Android
    tikTokEvents.addListener('onAuthCompleted', (resp) => {
      handleTikTokAuth(resp.code, !!resp.status, resp.status)
    })

    tikTokAuth(handleTikTokAuth)
  })
}

export const useTikTokAuth = (args: UseTikTokAuthArguments) => {
  return createUseTikTokAuthHook({
    authenticate,
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
