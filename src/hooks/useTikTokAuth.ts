import React from 'react'

// Polyfills
import 'whatwg-fetch'
import 'url-search-params-polyfill'

import { IDENTITY_SERVICE } from 'services/AudiusBackend'

type useTikTokAuthOptions = {
  onError: (e: Error) => void
}

type WithAuthCallback = (accessToken: string, openId: string) => void

export const useTikTokAuth = ({ onError }: useTikTokAuthOptions) => {
  const withAuth = (callback: WithAuthCallback) => {
    const accessToken = window.localStorage.getItem('tikTokAccessToken')
    const openId = window.localStorage.getItem('tikTokOpenId')

    // TODO: sk - check if not expired
    if (accessToken && openId) {
      callback(accessToken, openId)
    } else {
      getRequestToken(callback)
    }
  }

  const getRequestToken = (callback: WithAuthCallback) => {
    const popup = openPopup()

    if (popup) {
      const authenticationUrl = `${IDENTITY_SERVICE}/tikTok`

      popup.location.href = authenticationUrl
      poll(popup, callback)
    }
  }

  const openPopup = () => {
    return window.open(
      '',
      '',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=600, height=400'
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
        `${IDENTITY_SERVICE}/tikTok/access_token`,
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
          data: { access_token, open_id }
        }
      } = await response.json()

      window.localStorage.setItem('tikTokAccessToken', access_token)
      window.localStorage.setItem('tikTokOpenId', open_id)

      // TODO: handle expiration
      // window.localStorage.setItem('tikTokAccessTokenExpiration', open_id)
      callback(access_token, open_id)
    } catch (error) {
      return onError(error)
    }
  }

  return withAuth
}
