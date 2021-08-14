import React from 'react'

import moment from 'moment'

// Polyfills
import 'whatwg-fetch'
import 'url-search-params-polyfill'

import { IDENTITY_SERVICE } from 'services/AudiusBackend'
import { Name } from 'services/analytics'
import { RequestTikTokAuthMessage } from 'services/native-mobile-interface/oauth'
import { useRecord, make } from 'store/analytics/actions'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE

type useTikTokAuthOptions = {
  onError: (e: Error) => void
}

type WithAuthCallback = (accessToken: string, openId: string) => void

/**
 * A hook that returns a withAuth function that can be passed a function which will
 * be provided with the TikTok credentials on existing or successful auth
 * @param {Object} options
 * @returns {Function}
 */
export const useTikTokAuth = ({
  onError: errorCallback
}: useTikTokAuthOptions): ((callback: WithAuthCallback) => void) => {
  const record = useRecord()

  const onError = (e: Error) => {
    errorCallback(e)
    record(make(Name.TIKTOK_OAUTH_ERROR, { error: e.message }))
  }

  const withAuth = (successCallback: WithAuthCallback) => {
    const callback: WithAuthCallback = (accessToken, openId) => {
      successCallback(accessToken, openId)
      record(make(Name.TIKTOK_COMPLETE_OAUTH, {}))
    }

    const accessToken = window.localStorage.getItem('tikTokAccessToken')
    const openId = window.localStorage.getItem('tikTokOpenId')
    const expiration = window.localStorage.getItem(
      'tikTokAccessTokenExpiration'
    )

    const isExpired = expiration && moment().isAfter(expiration)
    if (accessToken && openId && !isExpired) {
      callback(accessToken, openId)
    } else {
      record(make(Name.TIKTOK_START_OAUTH, {}))
      getRequestToken(callback, !!NATIVE_MOBILE)
    }
  }

  const getRequestToken = async (
    callback: WithAuthCallback,
    isNativeMobile: boolean
  ) => {
    const authenticationUrl = `${IDENTITY_SERVICE}/tiktok`

    if (isNativeMobile) {
      const message = new RequestTikTokAuthMessage(authenticationUrl)
      message.send()
      const response = await message.receive()

      const { authorizationCode, csrfState } = response
      if (authorizationCode && csrfState) {
        getAccessToken(authorizationCode, csrfState, callback)
      } else {
        onError(new Error('Native mobile TikTok auth failed'))
      }
    } else {
      const popup = openPopup()

      if (popup) {
        popup.location.href = authenticationUrl
        poll(popup, callback)
      }
    }
  }

  const openPopup = () => {
    return window.open(
      '',
      '',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=600, height=1000'
    )
  }

  const poll = (popup: Window, callback: WithAuthCallback) => {
    const interval = setInterval(async () => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(interval)
        onError(new Error('Popup has been closed by user'))
        return
      }

      const closeDialog = () => {
        clearInterval(interval)
        popup.close()
      }

      try {
        if (
          !popup.location.hostname.includes('tiktok.com') &&
          popup.location.hostname !== ''
        ) {
          if (popup.location.search) {
            const query = new URLSearchParams(popup.location.search)

            const authorizationCode = query.get('code')
            const csrfState = query.get('state')
            const error = query.get('error')
            if (authorizationCode && csrfState) {
              closeDialog()
              return await getAccessToken(
                authorizationCode,
                csrfState,
                callback
              )
            } else {
              closeDialog()
              return onError(
                new Error(error || 'An error occured during OAuth')
              )
            }
          } else {
            closeDialog()
            return onError(
              new Error(
                'OAuth redirect has occurred but no query or hash parameters were found. ' +
                  'They were either not set during the redirect, or were removed—typically by a ' +
                  'routing library—before Twitter react component could read it.'
              )
            )
          }
        }
      } catch (error) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        // This will catch until the popup is redirected back to the same origin
      }
    }, 500)
  }

  const getAccessToken = async (
    authorizationCode: string,
    csrfState: string,
    callback: WithAuthCallback
  ) => {
    try {
      const response = await window.fetch(
        `${IDENTITY_SERVICE}/tiktok/access_token`,
        {
          credentials: 'include',
          method: 'POST',
          body: JSON.stringify({
            code: authorizationCode,
            state: csrfState
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const {
        data: {
          data: { access_token, open_id, expires_in }
        }
      } = await response.json()

      window.localStorage.setItem('tikTokAccessToken', access_token)
      window.localStorage.setItem('tikTokOpenId', open_id)

      const expirationDate = moment().add(expires_in, 's').format()
      window.localStorage.setItem('tikTokAccessTokenExpiration', expirationDate)

      callback(access_token, open_id)
    } catch (error) {
      return onError(error)
    }
  }

  return withAuth
}
