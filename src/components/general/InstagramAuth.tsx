import React, { ReactNode, useCallback } from 'react'
import cn from 'classnames'
import 'url-search-params-polyfill'

import { RequestInstagramAuthMessage } from 'services/native-mobile-interface/oauth'

const NATIVE_MOBILE = process.env.REACT_APP_NATIVE_MOBILE
const HOSTNAME = process.env.REACT_APP_PUBLIC_HOSTNAME
const INSTAGRAM_APP_ID = process.env.REACT_APP_INSTAGRAM_APP_ID
const INSTAGRAM_REDIRECT_URL = process.env.REACT_APP_INSTAGRAM_REDIRECT_URL
const instagramAuthorizeUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URL}&scope=user_profile,user_media&response_type=code`

type InstagramAuthProps = {
  dialogWidth?: number
  dialogHeight?: number
  profileUrl: string
  onClick: () => void
  onSuccess: (uuid: string, profile: any) => void
  onFailure: (error: any) => void
  style?: object
  disabled?: boolean
  className?: string
  children?: ReactNode
  text?: string
}

const InstagramAuth = ({
  dialogWidth = 400,
  dialogHeight = 740,
  profileUrl,
  onClick = () => {},
  onSuccess = (uuid: string, profile: any) => {},
  onFailure = () => {},
  style = {},
  disabled = false,
  className,
  children,
  text = 'Sign in with Instagram'
}: InstagramAuthProps) => {
  // Opens a popup window for the instagram authentication
  const openPopup = useCallback(() => {
    return window.open(
      '',
      '',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${dialogWidth}, height=${dialogHeight}`
    )
  }, [dialogWidth, dialogHeight])

  const getProfile = useCallback(
    async code => {
      try {
        const profileResp = await window.fetch(profileUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })
        const profileRespJson = await profileResp.json()
        return onSuccess(profileRespJson.id, profileRespJson)
      } catch (err) {
        console.log(err)
        onFailure(err.message)
      }
    },
    [profileUrl, onSuccess, onFailure]
  )

  const polling = useCallback(
    (popup: any) => {
      const pollingInterval = setInterval(() => {
        if (!popup || popup.closed || popup.closed === undefined) {
          clearInterval(pollingInterval)
          onFailure(new Error('Popup has been closed by user'))
          return
        }

        const closeDialog = () => {
          clearInterval(pollingInterval)
          console.log(popup)
          popup.close()
        }
        try {
          if (
            popup.location.hostname.includes(HOSTNAME) ||
            popup.location.hostname.includes(window.location.hostname)
          ) {
            if (popup.location.search) {
              const query = new URLSearchParams(popup.location.search)

              const instagramCode = query.get('code')
              if (instagramCode === null) return
              closeDialog()
              return getProfile(instagramCode)
            } else {
              closeDialog()
              return onFailure(
                new Error(
                  'OAuth redirect has occurred but no query or hash parameters were found. ' +
                    'They were either not set during the redirect, or were removed—typically by a ' +
                    'routing library—before Instagram react component could read it.'
                )
              )
            }
          }
        } catch (error) {
          // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
          // A hack to get around same-origin security policy errors in IE.
        }
      }, 500)
    },
    [getProfile, onFailure]
  )

  const getRequestToken = useCallback(() => {
    const popup = openPopup()
    if (!popup) {
      console.error('unable to open window')
    }
    try {
      if (popup) {
        // @ts-ignore
        popup.location = instagramAuthorizeUrl
        // @ts-ignore
        polling(popup)
      }
    } catch (error) {
      if (popup) popup.close()
      return onFailure(error)
    }
  }, [openPopup, polling, onFailure])

  const onNativeVerification = useCallback(async () => {
    try {
      if (onClick) onClick()
      const message = new RequestInstagramAuthMessage(instagramAuthorizeUrl)
      message.send()
      const response = await message.receive()
      if (response.code) {
        return await getProfile(response.code)
      } else {
        onFailure(new Error('Unable to retrieve information'))
      }
    } catch (error) {
      onFailure(error)
    }
  }, [onClick, onFailure, getProfile])

  const onButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (onClick) onClick()
      return getRequestToken()
    },
    [onClick, getRequestToken]
  )

  const getDefaultButtonContent = useCallback(() => <span>{text}</span>, [text])

  return (
    <div
      onClick={NATIVE_MOBILE ? onNativeVerification : onButtonClick}
      style={style}
      className={cn({
        [className!]: !!className,
        disabled: !!disabled
      })}
    >
      {children || getDefaultButtonContent()}
    </div>
  )
}

export default InstagramAuth
