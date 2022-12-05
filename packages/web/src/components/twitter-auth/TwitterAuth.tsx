import { CSSProperties, MouseEventHandler, ReactNode } from 'react'

import 'whatwg-fetch'
import 'url-search-params-polyfill'

export type TwitterAuthProps = {
  children?: ReactNode
  className?: string
  credentials?: 'omit' | 'same-origin' | 'include'
  customHeaders?: Record<string, any>
  dialogHeight?: number
  dialogWidth?: number
  forceLogin?: boolean
  loginUrl: string
  onClick: () => void
  onFailure: (error: any) => void
  onSuccess: (response: Body) => void
  requestTokenUrl: string
  screenName?: string
  style?: CSSProperties
  text?: string
}

const messages = {
  signIn: 'Sign in with Twitter'
}

const TwitterAuth = (props: TwitterAuthProps) => {
  const {
    children,
    className,
    credentials = 'same-origin',
    customHeaders,
    dialogHeight = 400,
    dialogWidth = 600,
    forceLogin = false,
    loginUrl,
    onClick,
    onFailure,
    onSuccess,
    requestTokenUrl,
    screenName,
    style,
    text = messages.signIn
  } = props

  const onButtonClick: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    onClick?.()
    return getRequestToken()
  }

  const getHeaders = () => {
    return { ...customHeaders, 'Content-Type': 'application/json' }
  }

  const getRequestToken = () => {
    const popup = openPopup()

    return window
      .fetch(requestTokenUrl, {
        method: 'POST',
        credentials,
        headers: getHeaders()
      })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        let authenticationUrl = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}&force_login=${forceLogin}`

        if (screenName) {
          authenticationUrl = `${authenticationUrl}&screen_name=${screenName}`
        }

        if (popup) {
          popup.location = authenticationUrl
          polling(popup)
        }
      })
      .catch((error) => {
        popup?.close()
        return onFailure(error)
      })
  }

  const openPopup = () => {
    const w = dialogWidth
    const h = dialogHeight

    return window.open(
      '',
      '',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}`
    )
  }

  const polling = (popup: Window) => {
    const pollingInterval = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(pollingInterval)
        onFailure(new Error('Popup has been closed by user'))
        return
      }

      const closeDialog = () => {
        clearInterval(pollingInterval)
        popup.close()
      }
      try {
        if (
          !popup.location.hostname.includes('api.twitter.com') &&
          popup.location.hostname !== ''
        ) {
          if (popup.location.search) {
            const query = new URLSearchParams(popup.location.search)

            const oauthToken = query.get('oauth_token')
            const oauthVerifier = query.get('oauth_verifier')
            if (oauthToken === null || oauthVerifier === null) return
            closeDialog()
            return getOauthToken(oauthVerifier, oauthToken)
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

  const getOauthToken = (oAuthVerifier: string, oauthToken: string) => {
    return window
      .fetch(
        `${loginUrl}?oauth_verifier=${oAuthVerifier}&oauth_token=${oauthToken}`,
        {
          method: 'POST',
          credentials,
          headers: getHeaders()
        }
      )
      .then((response) => {
        if (!response.ok) {
          response.json().then((json) => onFailure(json.error))
        }
        onSuccess(response)
      })
      .catch((error) => {
        return onFailure(error)
      })
  }

  const getDefaultButtonContent = () => {
    return <span>{text}</span>
  }

  return (
    <div onClick={onButtonClick} style={style} className={className}>
      {children || getDefaultButtonContent()}
    </div>
  )
}

export default TwitterAuth
