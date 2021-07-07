import React from 'react'

import { Button } from '@audius/stems'

// Polyfills
import 'whatwg-fetch'
import 'url-search-params-polyfill'

import { IDENTITY_SERVICE } from 'services/AudiusBackend'

type TikTokAuthProps = {
  onFailure: (e: Error) => void
  onSuccess: (accessToken: string) => void
  style: Object
  className: string
  dialogWidth: number
  dialogHeight: number
}

const TikTokAuth = ({
  dialogHeight,
  dialogWidth,
  onFailure,
  onSuccess
}: TikTokAuthProps) => {
  const onButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    return getRequestToken()
  }

  const getRequestToken = () => {
    const popup = openPopup()

    if (popup) {
      const authenticationUrl = `${IDENTITY_SERVICE}/tikTok`

      popup.location.href = authenticationUrl
      poll(popup)
    }
  }

  const openPopup = () => {
    return window.open(
      '',
      '',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${dialogWidth}, height=${dialogHeight}`
    )
  }

  const poll = (popup: Window) => {
    const interval = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(interval)
        onFailure(new Error('Popup has been closed by user'))
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
            const csrfState = query.get('csrfState')
            const error = query.get('error')
            if (authorizationCode && csrfState) {
              closeDialog()
              return getAccessToken(authorizationCode, csrfState)
            }
          } else {
            closeDialog()
            return onFailure(
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
        // A hack to get around same-origin security policy errors in IE.
      }
    }, 500)
  }

  const getAccessToken = (authorizationCode: string, csrfState: string) => {
    // TODO: sk - check csrfState
    return window
      .fetch(`${IDENTITY_SERVICE}/tikTok/access_token`, {
        method: 'POST',
        body: JSON.stringify({
          authorization_code: authorizationCode
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        onSuccess(String(response))
      })
      .catch(error => {
        return onFailure(error)
      })
  }

  return <Button onClick={onButtonClick} text='Sign In With TikTok' />
}

export default TikTokAuth
